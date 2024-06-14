const { body, validationResult } = require('express-validator');
const PhoneNumber = require('libphonenumber-js')
const isValidMobileNumber = (value) => {
    try {
        const phoneNumber = PhoneNumber.parse(value);
        return PhoneNumber.isValidNumber(phoneNumber, 'MOBILE');
    } catch (error) {
        return false;
    }
};

exports.adminValidation = [
    body('name').trim().isLength({ min: 3 }).withMessage('Please enter a name that is at least 3 characters long.'),
    body('password').trim().isLength({ min: 8 }).withMessage('Your password must be at least 8 characters long.'),
    body('email').isEmail(),
    body('phone').custom(isValidMobileNumber).withMessage('Please enter a valid phone number.')];
    
exports.adminPasswordValidation = [  
    body('newPassword')
    .isLength({ min: 8 }).withMessage('Your password must be at least 8 characters long.')
    .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
            throw new Error('Your password confirmation does not match the password you entered. Please try again');
        }
        return true;
    })
];
exports.clientValidation = [
    body('name').trim().isLength({ min: 3 }).withMessage('Please enter a name that is at least 3 characters long.'),
    body('email').isEmail(),
    body('phone').custom(isValidMobileNumber).withMessage('Please enter a valid phone number.'),
];
exports.adminLoginValidation = [
    body('password').trim().isLength({ min: 8 }).withMessage('Your password must be at least 8 characters long.'),
    body('email').isEmail()
];
exports.adminForgetPasswordValidation = [
    body('email').isEmail()
];

  
