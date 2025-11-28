// controllers/controller.js
const Station = require('../model/Station');
const Comment = require('../model/Comment');


/**
 * Maps the current day index (0-6) to a database key.
 * We default Sat/Sun to 'monday' because we currently lack weekend-specific data.
 */
function getCurrentDayString() {
    const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ...
    const dayMap = [
        'monday',    // 0 = Sunday (mapped to Mon)
        'monday',    // 1 = Monday
        'tuesday',   // 2 = Tuesday
        'wednesday', // 3 = Wednesday
        'thursday',  // 4 = Thursday
        'friday',    // 5 = Friday
        'monday'     // 6 = Saturday (mapped to Mon)
    ];
    return dayMap[dayIndex];
}


// Categorizes a numeric crowd density (0-100) into 'light', 'moderate', or 'heavy'.

function getDensityCategory(density) {
    if (density >= 80) return 'heavy';
    if (density >= 50) return 'moderate';
    return 'light';
}


const controller = {

    getHomePage: async (req, res) => {
        try {
            // Setup time variables for live status
            const currentDay = getCurrentDayString();
            const currentHour = new Date().getHours(); 
            
            // Fetch all stations sorted by their logical order (Station 1 to Station N)
            const stationData = await Station.find({}).sort({ order: 1 }).lean();
            
            // Process Northbound List
            const stationsNB = stationData.map(station => {
                let crowdLevel = 'light';
                // Check if we have historical data for today/this hour
                if (station.historicalDataNB?.[currentDay]) {
                    const density = station.historicalDataNB[currentDay][currentHour];
                    crowdLevel = getDensityCategory(density);
                }
                return {
                    _id: station._id,
                    name: station.name,
                    crowdLevel 
                };
            });

            // Process Southbound List
            // We reverse the Southbound list so it displays geographically correct 
            const stationsSB = stationData.map(station => {
                let crowdLevel = 'light';
                if (station.historicalDataSB?.[currentDay]) {
                    const density = station.historicalDataSB[currentDay][currentHour];
                    crowdLevel = getDensityCategory(density);
                }
                return {
                    _id: station._id,
                    name: station.name,
                    crowdLevel 
                };
            }).reverse(); 

            // Fetch Comments
            let commentData = await Comment.find({}).sort({ timestamp: -1 }).limit(10).lean();

            // Handle UI messages
            let errorMessage = '';
            if (req.query.error === 'search_not_found') {
                errorMessage = 'No station was found matching your search.';
            }

            // User Permissions & Vote Status
            // If logged in, check which comments belong to this user or if they liked them
            if (req.session.user) {
                const userId = req.session.user._id; 
                const userRole = req.session.user.role; 
                
                commentData.forEach(comment => {
                    // 1. Check Vote Status
                    comment.userVote = 'none';
                    if (comment.upvotedBy?.some(id => id.toString() === userId)) {
                        comment.userVote = 'upvoted';
                    } else if (comment.downvotedBy?.some(id => id.toString() === userId)) {
                        comment.userVote = 'downvoted';
                    }

                    // 2. Check Delete Permissions (Author or Admin)
                    const isAuthor = comment.authorId?.toString() === userId;
                    comment.canDelete = isAuthor || userRole === 'admin';

                    // 3. Check Edit Permissions (Author Only)
                    comment.canEdit = isAuthor;
                });
            }

            res.render('index', {
                pageTitle: 'LRT Density',
                stationsNB,   
                stationsSB,   
                comments: commentData,
                user: req.session.user,
                errorMessage
            });

        } catch (error) {
            console.error('Error fetching home page data:', error);
            res.status(500).send('An error occurred while fetching home page data.');
        }
    },

    getAboutPage: (req, res) => {
        res.render('about', { 
            pageTitle: 'About LRT Density',
            user: req.session.user
        });
    }
};


module.exports = controller;
