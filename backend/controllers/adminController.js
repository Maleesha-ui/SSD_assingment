const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Booking = require('../models/Booking');
const FuneralPackage = require('../models/Package');
const Staff = require('../models/Staff');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalUsers, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      pendingOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean();

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      items: order.items,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort('-createdAt')
      .lean();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    const filter = role ? { role } : {};
    
    const users = await User.find(filter)
      .select('name email role createdAt')
      .sort('-createdAt')
      .lean();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: error.message });
  }
}; 

//MARK: Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);  
    res.status(500).json({ error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    await Booking.create(req.body);
    res.status(201).json({ message: 'Added'});
  } catch (error) {
    console.error('Error creating booking:', error);  
    res.status(400).json({ error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error); 
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);  
  }
};

exports.getAllPackages = async (req, res) => {
  try {
    const packages = await FuneralPackage.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const { name, price, description, services, image } = req.body;
    const newPackage = new FuneralPackage({ name, price, description, services, image });
    await newPackage.save();
    res.status(201).json({ message: 'Added'});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPackage = await FuneralPackage.findByIdAndUpdate(id.trim(), req.body, { new: true });
    if (!updatedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FuneralPackage.findByIdAndDelete(id.trim());
    if (!deleted) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveLeaveRequest = async (req, res) => {
  try {
    const { leaveId, status } = req.body;
    const staff = await Staff.findOne({ 'leaveRequests._id': leaveId });
    if (!staff) return res.status(404).json({ message: 'Leave request not found' });

    staff.leaveRequests.id(leaveId).status = status;
    await staff.save();
    res.json({ message: 'Leave request updated', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { name, email, password, staffDetails } = req.body;
    
    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'staff',
      staffDetails,
    });
    await Staff.create({ userId: user._id });
    
    // Return user without password in response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ message: 'Staff added successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { staffId, taskTitle, taskDescription, startDate, dueDate, priorityLevel, attachments } = req.body;
    
    console.log('Assign Task Request:', { 
      staffId, 
      taskTitle, 
      taskDescription, 
      startDate, 
      dueDate, 
      priorityLevel, 
      attachments 
    });
    
    const user = await User.findById(staffId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let staff = await Staff.findOne({ userId: staffId });
    if (!staff) {
      console.log(`Staff document not found for userId: ${staffId}, creating a new one...`);
      staff = new Staff({ userId: staffId });
    }

    const formattedStartDate = startDate ? new Date(startDate) : null;
    const formattedDueDate = dueDate ? new Date(dueDate) : null;

    if (formattedStartDate && isNaN(formattedStartDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start date format' });
    }
    
    if (formattedDueDate && isNaN(formattedDueDate.getTime())) {
      return res.status(400).json({ message: 'Invalid due date format' });
    }

    const newTask = {
      taskTitle,
      taskDescription,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      priorityLevel,
      attachments
    };
    
    staff.tasks.push(newTask);
    await staff.save();
    
    console.log('Task assigned successfully:', staff.tasks[staff.tasks.length - 1]);
    res.status(201).json({ message: 'Task assigned', task: staff.tasks[staff.tasks.length - 1] });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name email staffDetails' 
      });
    
    const formattedStaff = staff.map(staffMember => {
      const userData = staffMember.userId;
            const formattedAttendance = staffMember.attendance.map(record => {
        const recordObj = record.toObject();
        
        if (recordObj.date) {
          recordObj.date = recordObj.date.toISOString();
        }
        
        if (recordObj.checkIn) {
          const date = new Date(recordObj.checkIn);
          recordObj.checkIn = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        if (recordObj.checkOut) {
          const date = new Date(recordObj.checkOut);
          recordObj.checkOut = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        return recordObj;
      });
      
      return {
        _id: staffMember._id,
        userId: staffMember.userId._id,
        name: userData.name,
        email: userData.email,
        staffDetails: userData.staffDetails,
        attendance: formattedAttendance
      };
    });
    
    res.json(formattedStaff);
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getFeedbacks= async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).populate({
      path: 'user',
      model: User,
      select: 'name email'
    })
    if(feedbacks.length > 0){
      return res.status(200).send(feedbacks);
    }else{
      return res.status(200).send([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFeedbackById= async (req, res) => {
  const { id } = req.params;
  try {
    
    const result = await Feedback.deleteOne({ _id: id });
    
    if(result.deletedCount > 0){
      return res.status(200).send({ message: 'Deleted'});
    }else{
      return res.status(400).send({ message: 'Faild'});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFeedbackById= async (req, res) => {
  const { id } = req.params;
  const { message,rating,serviceType } = req.body;
  try {
    
    await Feedback.updateOne({ _id: id }, { $set: {
      message,rating,serviceType
    }})
    return res.status(200).send({ message: 'Updated.'});
  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStaffTasks = async (req, res) => {
  try {
    const staffMembers = await Staff.find().populate('userId', 'name email');
    
    const allTasks = staffMembers.map(staff => {
      return staff.tasks.map(task => ({
        ...task.toObject(),
        staffId: staff._id,
        staffName: staff.userId.name,
        staffEmail: staff.userId.email
      }));
    }).flat();
    
    const sortedTasks = allTasks.sort((a, b) => {
      if (a.status === 'pending' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status === 'pending') return 1;
      
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    res.json(sortedTasks);
  } catch (error) {
    console.error('Error fetching staff tasks:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const staffMembers = await Staff.find().populate('userId', 'name email');
    
    const staffWithLeaveRequests = staffMembers.map(staff => {
      return {
        _id: staff._id,
        userId: staff.userId._id,
        name: staff.userId.name,
        email: staff.userId.email,
        leaveRequests: staff.leaveRequests || []
      };
    });
    
    res.json(staffWithLeaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: error.message });
  }
};

