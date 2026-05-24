const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const sendPaymentReceipt = async (order, payment, userEmail) => {
  try {
    // Read email template
    const templatePath = path.join(__dirname, '../templates/paymentReceipt.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    
    // Compile template
    const compiledTemplate = handlebars.compile(template);
    
    // Prepare data for template
    const data = {
      orderNumber: order.orderNumber,
      date: new Date(payment.createdAt).toLocaleDateString(),
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: (item.price * item.quantity).toFixed(2)
      })),
      totalAmount: order.totalAmount.toFixed(2),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId
    };

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Payment Receipt for Order #${order.orderNumber}`,
      html: compiledTemplate(data)
    });

    console.log('Payment receipt email sent successfully');
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    throw error;
  }
};


const sendTaskAssignmentNotification = async (task, staffEmail) => {
  try {
    const templatePath = path.join(__dirname, '../templates/taskAssignment.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);

    const data = {
      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription || 'No description provided',
      priorityLevel: task.priorityLevel,
      startDate: new Date(task.startDate).toLocaleDateString(),
      dueDate: new Date(task.dueDate).toLocaleDateString()
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: staffEmail,
      subject: `New Task Assigned: ${task.taskTitle}`,
      html: compiledTemplate(data)
    });

    console.log('Task assignment email sent successfully to', staffEmail);
  } catch (error) {
    console.error('Error sending task assignment notification:', error);
    throw error;
  }
};

const sendLeaveStatusNotification = async (leaveRequest, staffEmail) => {
  try {
    const templatePath = path.join(__dirname, '../templates/leaveStatus.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);

    const data = {
      leaveType: leaveRequest.leaveType,
      startDate: new Date(leaveRequest.startDate).toLocaleDateString(),
      endDate: new Date(leaveRequest.endDate).toLocaleDateString(),
      status: leaveRequest.status,
      reason: leaveRequest.reason || 'No reason provided'
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: staffEmail,
      subject: `Leave Request Status Update: ${leaveRequest.status}`,
      html: compiledTemplate(data)
    });

    console.log('Leave status email sent successfully to', staffEmail);
  } catch (error) {
    console.error('Error sending leave status notification:', error);
    throw error;
  }
};

module.exports = {
  sendPaymentReceipt,
  sendTaskAssignmentNotification,
  sendLeaveStatusNotification
};