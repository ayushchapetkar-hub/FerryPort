import AdminLog from "../models/AdminLog.js";

export const logAdminAction = (req, action, entityType, entityId, details = {}) =>
  AdminLog.create({
    admin: req.user._id,
    action,
    entityType,
    entityId,
    details,
    ipAddress: req.ip
  });
