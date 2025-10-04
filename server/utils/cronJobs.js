const Item = require('../models/Item');
const Bid = require('../models/Bid');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check for ended auctions and process them
const checkEndedAuctions = async () => {
  try {
    console.log('Checking for ended auctions...');
    
    // Find items that should have ended but are still active
    const endedItems = await Item.find({
      status: 'approved',
      endDate: { $lte: new Date() },
      isActive: true
    }).populate('userId', 'name email');

    console.log(`Found ${endedItems.length} ended auctions`);

    if (endedItems.length > 0) {
      for (const item of endedItems) {
        await processEndedAuction(item);
      }
      console.log(`Processed ${endedItems.length} ended auctions`);
    }
  } catch (error) {
    console.error('Error checking ended auctions:', error);
  }
};

// Check for auctions ending soon (within 1 hour) and send notifications
const checkEndingSoon = async () => {
  try {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const now = new Date();
    
    const endingSoonItems = await Item.find({
      status: 'approved',
      endDate: { $gte: now, $lte: oneHourFromNow },
      isActive: true
    }).populate('userId', 'name email');

    if (endingSoonItems.length > 0) {
      console.log(`Found ${endingSoonItems.length} auctions ending soon`);
      // Here you could send notifications to interested users
      // For now, just log them
      endingSoonItems.forEach(item => {
        console.log(`Auction ending soon: ${item.name} - ${item.currentPrice} ₪`);
      });
    }
  } catch (error) {
    console.error('Error checking ending soon auctions:', error);
  }
};

// Process a single ended auction
const processEndedAuction = async (item) => {
  try {
    console.log(`Processing ended auction: ${item.name}`);

    // Find the winning bid
    const winningBid = await Bid.findOne({
      itemId: item._id,
      isActive: true,
      isWinning: true
    }).populate('userId', 'name email phone');

    if (winningBid) {
      // Update item with winner and final stats
      await Item.findByIdAndUpdate(item._id, {
        status: 'ended',
        winnerId: winningBid.userId._id,
        isActive: false,
        finalPrice: winningBid.amount
      });

      // Send emails to seller and winner
      await sendAuctionEndEmails(item, winningBid);

      console.log(`Auction ended: ${item.name} - Winner: ${winningBid.userId.name} - Final Price: ${winningBid.amount} ₪`);
    } else {
      // No bids, just mark as ended
      await Item.findByIdAndUpdate(item._id, {
        status: 'ended',
        isActive: false,
        finalPrice: item.startPrice
      });

      // Notify seller that no bids were received
      await sendNoBidsEmail(item);

      console.log(`Auction ended with no bids: ${item.name}`);
    }
  } catch (error) {
    console.error(`Error processing auction ${item._id}:`, error);
  }
};

// Send emails to seller and winner
const sendAuctionEndEmails = async (item, winningBid) => {
  try {
    const seller = item.userId;
    const winner = winningBid.userId;

    // Email to seller
    const sellerEmailOptions = {
      from: process.env.EMAIL_USER,
      to: seller.email,
      subject: `המכירה שלך הסתיימה - ${item.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>המכירה שלך הסתיימה בהצלחה!</h2>
          <p>שלום ${seller.name},</p>
          <p>המכירה של "${item.name}" הסתיימה והפריט נמכר!</p>
          
          <h3>פרטי המכירה:</h3>
          <ul>
            <li><strong>שם הפריט:</strong> ${item.name}</li>
            <li><strong>מחיר סופי:</strong> ${item.currentPrice} ₪</li>
            <li><strong>הקונה:</strong> ${winner.name}</li>
            <li><strong>אימייל הקונה:</strong> ${winner.email}</li>
            <li><strong>טלפון הקונה:</strong> ${winner.phone || 'לא צוין'}</li>
          </ul>
          
          <p>אנא צור קשר עם הקונה כדי לתאם את איסוף הפריט.</p>
          <p>תודה שהשתמשת בפלטפורמה שלנו!</p>
        </div>
      `
    };

    // Email to winner
    const winnerEmailOptions = {
      from: process.env.EMAIL_USER,
      to: winner.email,
      subject: `הצעתך זכתה! - ${item.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>מזל טוב! הצעתך זכתה!</h2>
          <p>שלום ${winner.name},</p>
          <p>הצעתך על "${item.name}" זכתה במכירה!</p>
          
          <h3>פרטי הרכישה:</h3>
          <ul>
            <li><strong>שם הפריט:</strong> ${item.name}</li>
            <li><strong>מחיר ששילמת:</strong> ${item.currentPrice} ₪</li>
            <li><strong>המוכר:</strong> ${seller.name}</li>
            <li><strong>אימייל המוכר:</strong> ${seller.email}</li>
            <li><strong>מיקום איסוף:</strong> ${item.location}</li>
          </ul>
          
          <p>אנא צור קשר עם המוכר כדי לתאם את איסוף הפריט.</p>
          <p>תודה שהשתמשת בפלטפורמה שלנו!</p>
        </div>
      `
    };

    // Send emails
    await transporter.sendMail(sellerEmailOptions);
    await transporter.sendMail(winnerEmailOptions);

    console.log(`Emails sent for auction: ${item.name}`);
  } catch (error) {
    console.error('Error sending auction end emails:', error);
  }
};

// Send email to seller when no bids received
const sendNoBidsEmail = async (item) => {
  try {
    const seller = item.userId;

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: seller.email,
      subject: `המכירה שלך הסתיימה ללא הצעות - ${item.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>המכירה שלך הסתיימה ללא הצעות</h2>
          <p>שלום ${seller.name},</p>
          <p>המכירה של "${item.name}" הסתיימה אך לא התקבלו הצעות.</p>
          
          <h3>פרטי הפריט:</h3>
          <ul>
            <li><strong>שם הפריט:</strong> ${item.name}</li>
            <li><strong>מחיר פתיחה:</strong> ${item.startPrice} ₪</li>
            <li><strong>תאריך סיום:</strong> ${new Date(item.endDate).toLocaleDateString('he-IL')}</li>
          </ul>
          
          <p>אתה יכול לנסות להעלות את הפריט שוב עם מחיר פתיחה נמוך יותר או תיאור מפורט יותר.</p>
          <p>תודה שהשתמשת בפלטפורמה שלנו!</p>
        </div>
      `
    };

    await transporter.sendMail(emailOptions);
    console.log(`No bids email sent for: ${item.name}`);
  } catch (error) {
    console.error('Error sending no bids email:', error);
  }
};

module.exports = {
  checkEndedAuctions,
  checkEndingSoon
};
