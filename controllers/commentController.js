// controllers/commentController.js
const Comment = require('../model/Comment');
const Station = require('../model/Station'); 

const commentController = {

    postComment: async (req, res) => {
        // 1. Auth Check: Users must be logged in to comment
        if (!req.session.user) {
            return res.redirect('/login?error=comment');
        }
        
        const { commentText, stationId } = req.body; 

        try {
            // 2. Validate Station
            // We need to fetch the station mainly to get its 'name' for the redirect URL
            const station = await Station.findById(stationId);
            if (!station) {
                return res.redirect('/');
            }

            // 3. Create the Comment
            await Comment.create({
                authorId: req.session.user._id,
                authorUsername: req.session.user.username,
                stationId: stationId, 
                text: commentText
            });
            
            // 4. Redirect user back to the conversation
            return res.redirect(`/station/${station.name}`);

        } catch (error) {
            console.error('Error creating comment:', error);
            return res.redirect('/');
        }
    },

    postReaction: async (req, res) => {
        // Authentication check for API endpoints (returns JSON error instead of redirect)
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Please log in to react.' });
        }

        const { commentId, voteType } = req.body;
        const userId = req.session.user._id;

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ success: false, message: 'Invalid vote type.' });
        }

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

            // Check current vote status for this user
            // Note: We use string comparison to ensure ObjectId vs String doesn't cause bugs
            const hasUpvoted = comment.upvotedBy.includes(userId);
            const hasDownvoted = comment.downvotedBy.includes(userId);

            let update = {};
            let newVoteState = 'none';

            // Logic: Upvote Clicked
            if (voteType === 'upvote') {
                if (hasUpvoted) {
                    // Scenario A: Already upvoted -> Toggle OFF (Remove upvote)
                    update = { $inc: { upvotes: -1 }, $pull: { upvotedBy: userId } };
                    newVoteState = 'none';
                } else if (hasDownvoted) {
                    // Scenario B: Currently downvoted -> Switch to UP (Remove downvote, Add upvote)
                    update = { $inc: { upvotes: 1, downvotes: -1 }, $push: { upvotedBy: userId }, $pull: { downvotedBy: userId } };
                    newVoteState = 'upvoted';
                } else {
                    // Scenario C: No vote yet -> Add Upvote
                    update = { $inc: { upvotes: 1 }, $push: { upvotedBy: userId } };
                    newVoteState = 'upvoted';
                }
            } 
            // Logic: Downvote Clicked
            else if (voteType === 'downvote') {
                if (hasDownvoted) {
                    // Scenario A: Already downvoted -> Toggle OFF (Remove downvote)
                    update = { $inc: { downvotes: -1 }, $pull: { downvotedBy: userId } };
                    newVoteState = 'none';
                } else if (hasUpvoted) {
                    // Scenario B: Currently upvoted -> Switch to DOWN (Remove upvote, Add downvote)
                    update = { $inc: { downvotes: 1, upvotes: -1 }, $push: { downvotedBy: userId }, $pull: { upvotedBy: userId } };
                    newVoteState = 'downvoted';
                } else {
                    // Scenario C: No vote yet -> Add Downvote
                    update = { $inc: { downvotes: 1 }, $push: { downvotedBy: userId } };
                    newVoteState = 'downvoted';
                }
            }

            const updatedComment = await Comment.findByIdAndUpdate(commentId, update, { new: true });
            
            res.status(200).json({ 
                success: true, 
                upvotes: updatedComment.upvotes, 
                downvotes: updatedComment.downvotes, 
                newVoteState 
            });

        } catch (error) {
            console.error('Error posting reaction:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    },

    deleteComment: async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Please log in to delete.' });
        }

        const { commentId } = req.body;
        const userId = req.session.user._id;
        const userRole = req.session.user.role;

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

            // Authorization: Only the original Author OR an Admin can delete
            if (comment.authorId.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ success: false, message: 'You are not authorized to delete this comment.' });
            }

            await Comment.findByIdAndDelete(commentId);
            return res.status(200).json({ success: true, message: 'Comment deleted.' });

        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    },

    editComment: async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Please log in.' });
        }

        const { commentId, newText } = req.body;
        const userId = req.session.user._id;

        // Basic validation so we don't save empty strings
        if (!newText || newText.trim() === '') {
            return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
        }

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

            // Authorization: STRICTLY Author only (Admins usually shouldn't edit user words, only delete)
            if (comment.authorId.toString() !== userId) {
                return res.status(403).json({ success: false, message: 'You are not authorized to edit this comment.' });
            }

            comment.text = newText.trim();
            await comment.save();
            
            return res.status(200).json({ success: true, newText: comment.text });

        } catch (error) {
            console.error('Error editing comment:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    }
};

module.exports = commentController;