const BLACKLISTED_FIELDS = ['_id', 'password', 'createdAt']; // Fields users can't modify

exports.validateDetail = (req, res, next) => {
  const { fieldName } = req.body;
  
  if (BLACKLISTED_FIELDS.includes(fieldName)) {
    return res.status(400).json({
      success: false,
      error: "This field cannot be modified"
    });
  }
  
  // Prevent field names with special characters
  if (!/^[a-zA-Z0-9_]+$/.test(fieldName)) {
    return res.status(400).json({
      success: false,
      error: "Field name can only contain letters, numbers and underscores"
    });
  }
  
  next();
};