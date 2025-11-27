// controllers/stationController.js
const Station = require('../model/Station');
const Comment = require('../model/Comment');


function getCurrentDayString() {
    const dayIndex = new Date().getDay(); 
    const dayMap = ['monday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'monday'];
    return dayMap[dayIndex];
}

// Converts a numeric density score into a readable category (Light, Moderate, Heavy)
function getDensityCategory(density) {
    if (density >= 80) return 'heavy';
    if (density >= 50) return 'moderate';
    return 'light';
}

const stationController = {

    getStationDetail: async (req, res) => {
        try {
            const stationName = req.params.name;
            const stationData = await Station.findOne({ name: stationName }).lean();
            
            if (!stationData) {
                return res.status(404).render('error', { message: 'Station not found.' });
            }

            const platform = req.query.platform || 'nb'; // Default to Northbound if not specified

            // Calculate Live Crowd Status
            const currentDay = getCurrentDayString();
            const currentHour = new Date().getHours();
            
            // Check historical data for the current hour to estimate status
            let liveStatusNB = 'light';
            if (stationData.historicalDataNB?.[currentDay]) {
                liveStatusNB = getDensityCategory(stationData.historicalDataNB[currentDay][currentHour]);
            }

            let liveStatusSB = 'light';
            if (stationData.historicalDataSB?.[currentDay]) {
                liveStatusSB = getDensityCategory(stationData.historicalDataSB[currentDay][currentHour]);
            }

            // Fetch & Process Comments 
            // Pull comments, sort by newest, and include the author's username and avatar
            let commentData = await Comment.find({ stationId: stationData._id })
                .sort({ timestamp: -1 })
                .populate('authorId', 'username avatarUrl') 
                .lean();

            // specific user info for permission checks
            const userId = req.session.user?._id || null;
            const userRole = req.session.user?.role || null;

            // Loop through comments to handle display logic (Avatars, Permissions, Votes)
            commentData.forEach(comment => {
                // 1. Avatar fallback: Use a placeholder if the user has no avatar or is deleted
                comment.authorAvatarUrl = comment.authorId?.avatarUrl 
                    ? comment.authorId.avatarUrl 
                    : 'https://placehold.co/80x80/6b7280/ffffff?text=U';

                // 2. Permission flags: Determine if the current user can edit, delete, or has voted
                const authorIdStr = comment.authorId?._id.toString();

                comment.userVote = 'none';
                comment.canDelete = false;
                comment.canEdit = false;

                if (userId) {
                    // Check if user has already voted
                    if (comment.upvotedBy?.some(id => id.toString() === userId)) {
                        comment.userVote = 'upvoted';
                    } else if (comment.downvotedBy?.some(id => id.toString() === userId)) {
                        comment.userVote = 'downvoted';
                    }

                    // Grant delete rights to the author or an admin
                    if (authorIdStr && (authorIdStr === userId || userRole === 'admin')) {
                        comment.canDelete = true;
                    }

                    // Grant edit rights only to the author
                    if (authorIdStr && authorIdStr === userId) {
                        comment.canEdit = true;
                    }
                }
            });

            res.render('station_detail', {
                pageTitle: `Station: ${stationData.name}`,
                station: stationData,
                // Serialize historical data for frontend charts/graphs
                historicalDataNB: JSON.stringify(stationData.historicalDataNB),
                historicalDataSB: JSON.stringify(stationData.historicalDataSB),
                user: req.session.user,
                defaultPlatform: platform,
                liveStatusNB,
                liveStatusSB,
                comments: commentData
            });

        } catch (error) {
            console.error('Error fetching station detail:', error);
            res.status(500).render('error', { message: 'Error retrieving station data.' });
        }
    },

    getSearch: async (req, res) => {
        try {
            const query = req.query.query;
            if (!query) return res.redirect('/');

            // Case-insensitive regex search for station name
            const station = await Station.findOne({ 
                name: { $regex: query.trim(), $options: 'i' } 
            });

            if (station) {
                return res.redirect(`/station/${station.name}`);
            } else {
                return res.redirect('/?error=search_not_found');
            }
        } catch (error) {
            console.error('Error during search:', error);
            res.redirect('/');
        }
    }
};

module.exports = stationController;