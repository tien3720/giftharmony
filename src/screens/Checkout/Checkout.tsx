import React, { useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, CheckCircle, Truck, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useCart } from '../../contexts/CartContext';
import { useManualAuth } from '../../contexts/ManualAuthContext';
import { useToast } from '../../components/ui/toast';

interface CheckoutProps {
  onBack: () => void;
  onOrderComplete: () => void;
}

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const Checkout = ({ onBack, onOrderComplete }: CheckoutProps): JSX.Element => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useManualAuth();
  const { addToast } = useToast();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.full_name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    note: ''
  });

  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: 'bank',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua Internet Banking',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: <Phone className="h-5 w-5" />
    }
  ];

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Giao hàng tiêu chuẩn',
      time: '2-3 ngày làm việc',
      price: 30000,
      description: 'Giao hàng trong giờ hành chính'
    },
    {
      id: 'express',
      name: 'Giao hàng nhanh',
      time: 'Trong ngày',
      price: 50000,
      description: 'Giao hàng trong 4-6 giờ'
    },
    {
      id: 'premium',
      name: 'Giao hàng cao cấp',
      time: '2-4 giờ',
      price: 100000,
      description: 'Giao hàng ưu tiên, đóng gói sang trọng'
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!shippingInfo.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    if (!shippingInfo.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      addToast({
        type: 'error',
        title: 'Thông tin chưa đầy đủ',
        description: 'Vui lòng kiểm tra và điền đầy đủ thông tin',
        duration: 5000
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate order ID
      const orderId = `GH${Date.now().toString().slice(-6)}`;

      addToast({
        type: 'success',
        title: 'Đặt hàng thành công!',
        description: `Mã đơn hàng: ${orderId}. Chúng tôi sẽ liên hệ với bạn sớm nhất.`,
        duration: 5000
      });

      clearCart();
      onOrderComplete();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Đặt hàng thất bại',
        description: 'Có lỗi xảy ra, vui lòng thử lại sau',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const selectedDeliveryOption = deliveryOptions.find(option => option.id === selectedDelivery);
  const subtotal = getTotalPrice();
  const shippingCost = selectedDeliveryOption?.price || 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[#fffefc]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 font-['Poppins',Helvetica]">
              Thanh toán
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <Input
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Nhập họ và tên"
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <Input
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                    >
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện *
                    </label>
                    <Input
                      value={shippingInfo.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="Chọn quận/huyện"
                      className={errors.district ? 'border-red-500' : ''}
                    />
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã *
                    </label>
                    <Input
                      value={shippingInfo.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      placeholder="Chọn phường/xã"
                      className={errors.ward ? 'border-red-500' : ''}
                    />
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ cụ thể *
                  </label>
                  <Input
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Số nhà, tên đường..."
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={shippingInfo.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    placeholder="Ghi chú cho đơn hàng..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Phương thức giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDelivery === option.id
                        ? 'border-[#49bbbd] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={selectedDelivery === option.id}
                        onChange={(e) => setSelectedDelivery(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{option.name}</p>
                        <p className="text-sm text-gray-500">{option.time}</p>
                        <p className="text-xs text-gray-400">{option.description}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatPrice(option.price)}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-[#49bbbd] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="mr-3 text-[#49bbbd]">{method.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">
                  Đơn hàng ({items.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      <p className="font-medium text-[#49bbbd]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Tóm tắt thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-[#49bbbd]">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-[#49bbbd] hover:bg-[#3a9a9c] text-white h-12"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Đặt hàng
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <p>Bằng việc đặt hàng, bạn đồng ý với</p>
                  <p>
                    <button className="underline hover:text-gray-700">Điều khoản dịch vụ</button>
                    {' và '}
                    <button className="underline hover:text-gray-700">Chính sách bảo mật</button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-600">Bảo mật SSL</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-600">Thanh toán an toàn</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};