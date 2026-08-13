export interface OrderTimelineStep {
  key: string;
  label: string;
  desc: string;
}

/**
 * Kiểm tra xem đơn hàng có phải là dịch vụ Giặt giày hay không
 */
export const isShoeOrder = (order: any): boolean => {
  if (!order) return false;
  const name = (order.serviceId?.name || order.serviceName || order.service?.name || order.note || '').toLowerCase();
  const unit = (order.serviceId?.unit || order.unit || order.service?.unit || '').toLowerCase();
  return name.includes('giày') || name.includes('sneaker') || unit === 'đôi';
};

/**
 * Kiểm tra xem đơn hàng có phải là dịch vụ Giặt hấp Áo vest hay không
 */
export const isVestOrder = (order: any): boolean => {
  if (!order) return false;
  const name = (order.serviceId?.name || order.serviceName || order.service?.name || order.note || '').toLowerCase();
  return name.includes('vest') || name.includes('suit');
};

/**
 * Kiểm tra xem đơn hàng có giá cố định cần thanh toán VietQR trước hay không
 * (Giặt giày, Áo vest, hoặc dịch vụ tính theo món/đôi)
 */
export const isPrepaidRequiredOrder = (order: any): boolean => {
  if (!order) return false;
  const unit = (order.serviceId?.unit || order.unit || order.service?.unit || '').toLowerCase();
  return isShoeOrder(order) || isVestOrder(order) || unit === 'món' || unit === 'đôi' || unit === 'item';
};

/**
 * Trả về danh sách các bước tiến trình quy trình phù hợp với từng loại dịch vụ
 */
export const getStepsForOrder = (order: any): OrderTimelineStep[] => {
  if (isShoeOrder(order)) {
    return [
      { key: 'received',   label: '📦 Đã nhận đơn',              desc: 'Hệ thống đã tiếp nhận đơn giặt giày. Vui lòng thanh toán VietQR để nhân viên tới nhận giày.' },
      { key: 'picked_up',  label: '🛵 Đã lấy giày',             desc: 'Nhân viên đã nhận giày từ bạn và đang chuyển về trung tâm chăm sóc.' },
      { key: 'weighed',    label: '👟 Tiếp nhận & Kiểm tra giày', desc: 'Giày đã tới tiệm. Chuyên viên kiểm tra tình trạng da/vải & chuẩn bị dung dịch vệ sinh.' },
      { key: 'washing',    label: '🧼 Vệ sinh & Spa thủ công',    desc: 'Giày đang được vệ sinh thủ công 100% bằng dung dịch vệ sinh chuyên dụng.' },
      { key: 'drying',     label: '🌬️ Khử trùng UV & Sấy khô',   desc: 'Giày đang được sấy khô chuyên dụng và khử trùng bằng ánh sáng UV & diệt nấm.' },
      { key: 'delivering', label: '🚚 Đang giao trả giày',       desc: 'Shipper đang trên đường giao trả giày sạch thơm tận nhà.' },
      { key: 'completed',  label: '✅ Hoàn thành',               desc: 'Đã giao trả giày thành công. Hẹn gặp lại bạn!' },
    ];
  }

  if (isVestOrder(order)) {
    return [
      { key: 'received',   label: '📦 Đã nhận đơn',              desc: 'Hệ thống đã tiếp nhận đơn giặt hấp áo vest. Vui lòng thanh toán VietQR để nhân viên tới nhận áo.' },
      { key: 'picked_up',  label: '🛵 Đã lấy áo vest',           desc: 'Nhân viên đã nhận áo vest từ bạn và đang chuyển về trung tâm giặt hấp.' },
      { key: 'weighed',    label: '👔 Tiếp nhận & Kiểm tra áo vest', desc: 'Áo vest đã về tới tiệm. Chuyên viên kiểm tra chất liệu vải & xử lý vết bẩn thủ công.' },
      { key: 'washing',    label: '🧖‍♂️ Giặt hấp chuyên sâu',       desc: 'Áo vest đang được giặt hấp giữ form dáng nguyên bản bằng dung môi cao cấp.' },
      { key: 'drying',     label: '🌬️ Làm khô & Ép form',        desc: 'Áo vest đang được làm khô và là ép cẩn thận, treo bao nilon bảo vệ.' },
      { key: 'delivering', label: '🚚 Đang giao trả áo vest',     desc: 'Shipper đang trên đường giao trả áo vest tươm tất tận nhà.' },
      { key: 'completed',  label: '✅ Hoàn thành',               desc: 'Đã giao trả áo vest thành công. Hẹn gặp lại bạn!' },
    ];
  }

  // Mặc định cho Giặt sấy quần áo tiêu chuẩn (tính theo kg)
  return [
    { key: 'received',   label: '📦 Đã nhận đơn',          desc: 'Hệ thống đã tiếp nhận đơn hàng. Nhân viên đang chuẩn bị tới địa chỉ để nhận đồ.' },
    { key: 'picked_up',  label: '🛵 Đã lấy đồ',           desc: 'Nhân viên đã đến nhận đồ từ bạn và đang vận chuyển đồ về tiệm giặt.' },
    { key: 'weighed',    label: '⚖️ Đã cân đồ & Báo giá', desc: 'Đồ đã về tới tiệm. Nhân viên đã cân khối lượng thực tế và tải ảnh xác thực.' },
    { key: 'washing',    label: '🫧 Đang giặt',             desc: 'Đồ giặt đang được phân loại và giặt sạch bằng công nghệ Skill-Up.' },
    { key: 'drying',     label: '🌬️ Đang sấy/ủi',          desc: 'Quần áo đang được sấy khô thơm và là phẳng tươm tất.' },
    { key: 'delivering', label: '🚚 Đang giao',             desc: 'Shipper đang trên đường giao trả đồ sạch tận nhà.' },
    { key: 'completed',  label: '✅ Hoàn thành',            desc: 'Đơn hàng đã được giao nhận thành công. Hẹn gặp lại bạn!' },
  ];
};
