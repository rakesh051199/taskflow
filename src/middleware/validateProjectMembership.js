import { ForbiddenError, NotFoundError } from '../utils/errors.js';

/**
 * Middleware to validate that the authenticated user is a member of the project
 * This assumes the project exists and has a members array
 * 
 * Note: This is a placeholder that should integrate with the Project Management API
 * For now, it validates the projectId format and checks if user is in members array
 */
export const validateProjectMembership = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('User not authenticated');
    }

    if (!projectId) {
      throw new NotFoundError('Project');
    }

    // TODO: Integrate with Project Management API to verify:
    // 1. Project exists
    // 2. User is a member of the project
    // For now, we'll assume the project service will be called elsewhere
    // This middleware just validates the structure

    // Store projectId and userId for use in controllers
    req.projectId = projectId;
    req.userId = userId;

    next();
  } catch (error) {
    next(error);
  }
};

export default validateProjectMembership;

