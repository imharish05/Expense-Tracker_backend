const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db.js');
const http = require('http');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config(); // ✅ move to top before anything uses env vars

const { Staff, User, Payment } = require('./models');
const Stage = require('./models/Stage.js');
const Project = require('./models/Project.js');
const { Op } = require('sequelize');

Staff.sync().then(() => console.log("Staff table synced.")).catch(err => console.error(err));
Payment.sync().then(() => console.log("Payment table synced.")).catch(err => console.error(err));

const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/permissionRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');
const seedRoles = require('./seeders/roleSeeders.js');
const customerRoutes = require('./routes/customerRoutes');
const projectRoutes = require('./routes/projectRoutes.js');
const stageRoutes = require('./routes/stageRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const { protect } = require('./middleware/protect.js');

const app = express();

// Un commend this and delete the app.use(cors) and the file upload
// ✅ CORS — must be first before everything 

// const corsOptions = {
//     origin: [
//         'http://localhost:3000',
//         'http://172.16.0.163:3000',  // your local network frontend
//         'http://172.16.0.163:5000',
//     ],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
//     exposedHeaders: ['Content-Disposition'],  // needed for file downloads
//     credentials: true,
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions));

// app.use('/uploads', (req, res, next) => {
//     const origin = req.headers.origin;
//     const allowedOrigins = [
//         'http://localhost:3000',
//         'http://172.16.0.163:3000',
//         'http://172.16.0.163:5000',
//     ];
//     if (allowedOrigins.includes(origin)) {
//         res.header('Access-Control-Allow-Origin', origin);
//     }
//     res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     req.url = decodeURIComponent(req.url);
//     next();
// }, express.static(path.join(__dirname, 'uploads')));

app.use(cors())


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static uploads — AFTER cors, with decode + headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    req.url = decodeURIComponent(req.url);
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api", protect, roleRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/staffs', protect, staffRoutes);
app.use('/api/projects', protect, projectRoutes);
app.use('/api/stages', protect, stageRoutes);
app.use('/api/payments', protect, paymentRoutes);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

transporter.verify((error, success) => {
    if (error) console.log("Connection Error:", error.message);
    else console.log("Server Ready To Send Emails ✓");
});

// Helper function to run the notification check
const runNotificationCheck = async () => {
    const now = new Date();
    console.log("Observer: Running check at", now.toLocaleString());

    try {
        // 1. Completed but unpaid stages
        // FIX: removed payment_status check since it's null in your DB
        // FIX: check paid < amount using actual numbers instead
        const paymentPendingStages = await Stage.findAll({
            where: {
                status: 'Completed',                    // exact case from your DB
                completion_notified: false,
                paid: { [Op.lt]: sequelize.col('amount') }  // paid < amount
            },
            include: [{ model: Project }]
        });

        // 2. Overdue stages
        // FIX: was wrongly set to status: 'Completed' — flipped to non-completed
        // FIX: duration is in the past AND not null
        const overdueStages = await Stage.findAll({
            where: {
                status: { [Op.notIn]: ['Completed'] },  // NOT completed
                due_notified: false,                    // not yet notified
                duration: {
                    [Op.lte]: now,                      // deadline passed
                    [Op.ne]: null                       // has a deadline set
                }
            },
            include: [{ model: Project }]
        });

        console.log("Payment pending stages:", paymentPendingStages.length);
        console.log("Overdue stages:", overdueStages.length);

        for (const stage of paymentPendingStages) {
            const projectTitle = stage.Project?.projectName || 'Industrial Project';
            await sendFormattedEmail(stage, projectTitle, "Payment Pending", "#f39c12");
            await stage.update({ completion_notified: true }); // FIX: use update() not save()
        }

        for (const stage of overdueStages) {
            const projectTitle = stage.Project?.projectName || 'Industrial Project';
            await sendFormattedEmail(stage, projectTitle, "Deadline Overdue", "#e74c3c");
            await stage.update({ due_notified: true }); // FIX: use update() not save()
        }

    } catch (error) {
        console.error("Observer Error:", error.message); // FIX: log .message not full object
    }
};

// Run at 6:30 AM, 12:30 PM, and 6:30 PM every day
cron.schedule('30 6 * * *',  runNotificationCheck); // 6:30 AM
cron.schedule('30 12 * * *', runNotificationCheck); // 12:30 PM
cron.schedule('30 18 * * *', runNotificationCheck); // 6:30 PM
cron.schedule('25 17 * * *', runNotificationCheck); // 6:30 PM


// Mail
async function sendFormattedEmail(stage, projectTitle, alertType, brandColor) {
    // Check if duration exists before formatting, otherwise return "N/A" or "Not Set"
    const formattedDeadline = stage.duration 
        ? new Date(stage.duration).toLocaleDateString() 
        : "Not Set";

    const mailOptions = {
        from: `"Infinus Tech System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `[ALERT] ${alertType}: ${projectTitle}`,
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: ${brandColor}; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Infinustech Alert System</h1>
                <p style="margin: 5px 0 0 0;">Automatic Project Monitoring</p>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #333;">${alertType}</h2>
                <p style="color: #666; line-height: 1.6;">The following stage requires your immediate attention.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Project Name:</td>
                        <td style="padding: 10px; color: #333;">${projectTitle}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Stage Name:</td>
                        <td style="padding: 10px; color: #333;">${stage.stage_Name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Stage Amount:</td>
                        <td style="padding: 10px; color: #333;">${stage.amount}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Stage Paid:</td>
                        <td style="padding: 10px; color: #333;">${stage.paid}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Current Status:</td>
                        <td style="padding: 10px; color: #333;">${stage.status}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Deadline:</td>
                        <td style="padding: 10px; color: #333;">${formattedDeadline}</td>
                    </tr>
                </table>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.CLIENT_URL}/projects/${stage.projectId}" 
                       style="background-color: ${brandColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        View Project Details
                    </a>
                </div>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                &copy; 2026 Infinus Tech | Automated Industrial Solutions
            </div>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent for ${stage.stage_Name}`);
    } catch (err) {
        console.error("Email Sending Failed:", err);
    }
}


// In server.js — replace the uploads static line
// In server.js — replace your uploads static line with this
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    req.url = decodeURIComponent(req.url);
    next();
}, express.static(path.join(__dirname, 'uploads')));


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use("/api", protect, roleRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/staffs', protect, staffRoutes);
app.use('/api/projects', protect, projectRoutes);
app.use('/api/stages', protect, stageRoutes);
app.use('/api/payments', protect, paymentRoutes);


// POST /api/notify/email
// Called by frontend when new notifications pop up
// In server.js — add a simple in-memory cooldown
const emailCooldowns = new Map();
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

app.post('/api/notify/email', protect, async (req, res) => {
    const { stages } = req.body;
    if (!stages || stages.length === 0) {
        return res.status(400).json({ message: 'No stages provided' });
    }

    const now = Date.now();
    const stagesToEmail = stages.filter(stage => {
        console.log(stage);
        const key = `${stage.id}-${stage.type}`;
        const lastSent = emailCooldowns.get(key) || 0;
        return (now - lastSent) > COOLDOWN_MS;
    });

    if (stagesToEmail.length === 0) {
        return res.json({ success: true, sent: 0, reason: 'All on cooldown' });
    }

    try {
        for (const stage of stagesToEmail) {
            const alertType = stage.type === 'overdue' ? 'Deadline Overdue' : 'Payment Pending';
            await sendFormattedEmail(stage, stage.Project.projectName || 'Industrial Project', alertType, '#f39c12');
            emailCooldowns.set(`${stage.id}-${stage.type}`, now); // mark sent
        }
        res.json({ success: true, sent: stagesToEmail.length });
    } catch (err) {
        console.error("Manual email trigger error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

app.get('/', (req, res) => res.send('Server is running...'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');
        await sequelize.sync();
        console.log('✅ Database synchronized.');
        seedRoles();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

startServer();