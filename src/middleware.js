/** @format */

const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const User = require('../model/userModel');
const ErrorResponse = require('./utils/errorHandler');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer user@')
	) {
		// Set token from Bearer token in header
		token = req.headers.authorization.split('@')[1];
	} else {
		return next(res.status(401).json({ success: false, error: 'Unauthorized' }));
	}
	// Make sure token exists
	if (!token) {
		return next(
			new ErrorResponse(
				'Please login as a user to access this resources',
				401
			)
		);
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
		req.user = await User.findById(decoded.id);
		if (!req.user) {
			return next(
				new ErrorResponse('Not authorized to access this route', 401)
			);
		}
		
		next();
	} catch (err) {
		return next(new ErrorResponse('Token Expired', 500));
	}
});
