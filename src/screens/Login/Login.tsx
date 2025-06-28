import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useManualAuth } from "../../contexts/ManualAuthContext";
import { useToast } from "../../components/ui/toast";

interface LoginProps {
  onLoginSuccess?: () => void;
  onAdminLogin?: () => void;
  onBackToLanding?: () => void;
  defaultTab?: 'login' | 'register';
}

export const Login = ({ onLoginSuccess, onAdminLogin, onBackToLanding, defaultTab = 'login' }: LoginProps): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register } = useManualAuth();
  const { addToast } = useToast();

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginForm.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!loginForm.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (loginForm.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!registerForm.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    }
    
    if (!registerForm.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!registerForm.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (registerForm.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    if (!registerForm.agreeTerms) {
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản sử dụng";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      // Check for admin login
      if (loginForm.email === 'admin@giftharmony.com' && loginForm.password === 'admin123') {
        if (onAdminLogin) {
          onAdminLogin();
        }
        return;
      }

      await login(loginForm.email, loginForm.password);
      
      addToast({
        type: 'success',
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!',
        duration: 3000
      });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Đăng nhập thất bại',
        description: error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    try {
      await register(registerForm.email, registerForm.password, registerForm.fullName);
      
      addToast({
        type: 'success',
        title: 'Đăng ký thành công',
        description: 'Tài khoản của bạn đã được tạo thành công!',
        duration: 3000
      });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Đăng ký thất bại',
        description: error.message || 'Có lỗi xảy ra khi tạo tài khoản',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fffefc] flex flex-col justify-center items-center w-full min-h-screen px-4 py-8">
      <div className="w-full max-w-2xl">
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            {onBackToLanding && (
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={onBackToLanding}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại trang chủ
                </Button>
              </div>
            )}

            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl mb-6 sm:mb-7 font-['Poppins',Helvetica] text-center text-gray-900">
              Chào mừng đến với GiftHarmony
            </h1>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
              <TabsList className="w-full max-w-[333px] h-[59px] bg-[#d3c7c599] rounded-[33px] mx-auto mb-8 sm:mb-14 grid grid-cols-2">
                <TabsTrigger
                  value="login"
                  className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-[33px] font-['Poppins',Helvetica] font-normal text-sm sm:text-base"
                >
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-none rounded-[33px] font-['Poppins',Helvetica] font-normal text-sm sm:text-base"
                >
                  Đăng ký
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin}>
                  <div className="w-full max-w-[437px] mx-auto text-center mb-8 sm:mb-10">
                    <p className="font-['Poppins',Helvetica] font-normal text-[#5b5b5b] text-sm sm:text-base mb-8 sm:mb-10">
                      Nhập thông tin tài khoản của bạn!
                    </p>

                    <div className="mb-6">
                      <label className="block text-left font-['Poppins',Helvetica] font-normal text-black text-sm sm:text-base mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        placeholder="Nhập email (admin@giftharmony.com để vào quản lý)"
                        className={`h-[54px] rounded-[40px] border-[#49bbbd] pl-[30px] font-['Poppins',Helvetica] font-light text-[#acacac] text-[15px] w-full ${errors.email ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-left font-['Poppins',Helvetica] font-normal text-black text-sm sm:text-base mb-2">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          placeholder="Nhập mật khẩu (admin123 để vào quản lý)"
                          className={`h-[54px] rounded-[40px] border-[#49bbbd] pl-[30px] pr-[50px] font-['Poppins',Helvetica] font-light text-[#acacac] text-[15px] w-full ${errors.password ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 text-left">{errors.password}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full max-w-[437px] mx-auto mb-12 sm:mb-16 gap-4 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm({...loginForm, rememberMe: !!checked})}
                        className="border-black w-[15px] h-[15px] rounded-none"
                      />
                      <label
                        htmlFor="remember"
                        className="font-['Poppins',Helvetica] font-light text-black text-xs"
                      >
                        Lưu lại mật khẩu
                      </label>
                    </div>
                    <button 
                      type="button"
                      className="font-['Poppins',Helvetica] font-light text-black text-xs hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full max-w-[437px] h-[49px] bg-[#ccb3ac] hover:bg-[#bba39c] text-black rounded-[36px] font-['Poppins',Helvetica] font-normal text-sm sm:text-base mx-auto block transition-colors"
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Tài khoản quản lý: <strong>admin@giftharmony.com</strong> / <strong>admin123</strong>
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister}>
                  <div className="w-full max-w-[437px] mx-auto text-center mb-8 sm:mb-10">
                    <p className="font-['Poppins',Helvetica] font-normal text-[#5b5b5b] text-sm sm:text-base mb-8 sm:mb-10">
                      Tạo tài khoản mới của bạn!
                    </p>

                    <div className="mb-6">
                      <label className="block text-left font-['Poppins',Helvetica] font-normal text-black text-sm sm:text-base mb-2">
                        Họ và tên
                      </label>
                      <Input
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                        placeholder="Nhập họ và tên"
                        className={`h-[54px] rounded-[40px] border-[#49bbbd] pl-[30px] font-['Poppins',Helvetica] font-light text-[#acacac] text-[15px] w-full ${errors.fullName ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1 text-left">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-left font-['Poppins',Helvetica] font-normal text-black text-sm sm:text-base mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        placeholder="Nhập địa chỉ email"
                        className={`h-[54px] rounded-[40px] border-[#49bbbd] pl-[30px] font-['Poppins',Helvetica] font-light text-[#acacac] text-[15px] w-full ${errors.email ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-left font-['Poppins',Helvetica] font-normal text-black text-sm sm:text-base mb-2">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          placeholder="Nhập mật khẩu"
                          className={`h-[54px] rounded-[40px] border-[#49bbbd] pl-[30px] pr-[50px] font-['Poppins',Helvetica] font-light text-[#acacac] text-[15px] w-full ${errors.password ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 text-left">{errors.password}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-left font-['Poppins',Helvetica] font-normal text-black text-sm sm:text-base mb-2">
                        Xác nhận mật khẩu
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                          placeholder="Nhập lại mật khẩu"
                          className={`h-[54px] rounded-[40px] border-[#49bbbd] pl-[30px] pr-[50px] font-['Poppins',Helvetica] font-light text-[#acacac] text-[15px] w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1 text-left">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-[437px] mx-auto mb-6 sm:mb-8">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={registerForm.agreeTerms}
                        onCheckedChange={(checked) => setRegisterForm({...registerForm, agreeTerms: !!checked})}
                        className={`border-black w-[15px] h-[15px] rounded-none mt-1 flex-shrink-0 ${errors.agreeTerms ? 'border-red-500' : ''}`}
                      />
                      <label
                        htmlFor="terms"
                        className="font-['Poppins',Helvetica] font-light text-black text-xs leading-relaxed"
                      >
                        Tôi đồng ý với{" "}
                        <button type="button" className="underline hover:text-[#49bbbd]">
                          Điều khoản sử dụng
                        </button>{" "}
                        và{" "}
                        <button type="button" className="underline hover:text-[#49bbbd]">
                          Chính sách bảo mật
                        </button>
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <p className="text-red-500 text-sm mt-1">{errors.agreeTerms}</p>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full max-w-[437px] h-[49px] bg-[#ccb3ac] hover:bg-[#bba39c] text-black rounded-[36px] font-['Poppins',Helvetica] font-normal text-sm sm:text-base mx-auto block transition-colors"
                  >
                    {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};