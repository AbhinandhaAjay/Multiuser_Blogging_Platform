const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (email, token) => {
  const url = `http://localhost:5000/api/auth/verify/${token}`;
  
  await transporter.sendMail({
    from: `"Inkling Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Inkling Account",
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to Inkling!</h2>
        <p>Please click the button below to verify your account:</p>
        <a href="${url}" style="background: #2dd4bf; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a>
        <p style="margin-top: 20px; font-size: 0.8rem; color: #666;">If the button doesn't work, copy this link: ${url}</p>
      </div>
    `
  });
};

exports.sendResetPasswordEmail = async (email, token) => {
  const url = `http://localhost:5000/api/auth/reset-password/${token}`; // Note: Frontend will handle this route
  
  await transporter.sendMail({
    from: `"Inkling Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Inkling Password",
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${url}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 0.8rem; color: #666;">This link expires in 1 hour.</p>
        <p style="font-size: 0.8rem; color: #666;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
};
