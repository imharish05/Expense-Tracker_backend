const { Op } = require('sequelize');
const Stage = require('../models/Stage');
const Project = require('../models/Project');

exports.getPaymentReminders = async (req, res) => {
  try {
    const today = new Date();

    const reminders = await Stage.findAll({
      where: {
        [Op.or]: [
          {
            duration: { [Op.lt]: today },
            paid: { [Op.lt]: Stage.sequelize.col('amount') }
          },
          {
            status: 'Completed',
            paid: { [Op.lt]: Stage.sequelize.col('amount') }
          }
        ]
      },
      include: [{ 
        model: Project, 
        attributes: ['projectName', 'customerName'] 
      }]
    });

    console.log("Reminders found:", reminders.length);
    res.json({ success: true, reminders });
  } catch (error) {
    console.error("Reminder Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getOverdueStages = async (req, res) => {
    try {
        const now = new Date();
        const overdueStages = await Stage.findAll({
            where: {
                status: { [Op.ne]: 'Completed' },
                duration: { [Op.lte]: now }
            },
            include: [{ 
                model: Project,
                attributes: ['projectName'] 
            }],
            order: [['duration', 'ASC']]
        });

        console.log(overdueStages);
        

        // Format the data to match your Redux 'socketNotifications' structure
        const formattedNotifications = overdueStages.map(stage => ({
            id: stage.id,
            title: 'Deadline Reached!',
            message: `Stage "${stage.stage_Name}" for project ${stage.Project?.projectName || 'Unknown'} is due.`,
            projectId: stage.projectId,
            timestamp: stage.duration
        }));

        res.status(200).json(formattedNotifications);
    } catch (error) {
        console.error("Error fetching overdue stages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};