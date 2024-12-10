import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendNewMessageNotification = async (sellerEmail, horseName, buyerName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: `New Message About ${horseName}`,
      html: `
        <h1>New Message from GallopMart</h1>
        <p>You have received a new message from ${buyerName} about ${horseName}.</p>
        <p>Log in to your account to view and respond to the message.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="
          background-color: #0ea5e9;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin-top: 10px;
        ">
          View Message
        </a>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendFavoriteNotification = async (sellerEmail, horseName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: `${horseName} Added to Favorites`,
      html: `
        <h1>New Favorite on GallopMart</h1>
        <p>Someone has added ${horseName} to their favorites!</p>
        <p>This means your listing is getting attention. Make sure your information is up to date.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="
          background-color: #0ea5e9;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin-top: 10px;
        ">
          View Listing
        </a>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}; 