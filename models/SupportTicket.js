import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên của bạn'],
      trim: true,
      maxlength: [100, 'Tên không được vượt quá 100 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp địa chỉ email liên hệ'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập định dạng email hợp lệ',
      ],
    },
    topic: {
      type: String,
      default: 'Hỗ trợ chung',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung cần hỗ trợ'],
      trim: true,
      maxlength: [3000, 'Nội dung không được vượt quá 3000 ký tự'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
