import { NotFoundError, ValidationError } from '../utils/errors.js';

/**
 * Project Service - Interface for Project Management API
 * 
 * This service provides methods to validate project existence and membership.
 * In a real implementation, this would call the Project Management API.
 * 
 * For MVP, this can be implemented with direct database queries if projects
 * are in the same database, or HTTP calls if it's a separate service.
 */

/**
 * Check if a project exists
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project object if exists
 * @throws {NotFoundError} If project doesn't exist
 */
export const validateProjectExists = async (projectId) => {
  // TODO: Integrate with Project Management API
  // For now, this is a placeholder that should be implemented based on your architecture
  
  // Option 1: If projects are in the same database, query directly:
  // const Project = mongoose.model('Project');
  // const project = await Project.findById(projectId);
  // if (!project) throw new NotFoundError('Project');
  // return project;
  
  // Option 2: If Project Management API is a separate service, make HTTP call:
  // const response = await fetch(`${PROJECT_API_URL}/projects/${projectId}`);
  // if (!response.ok) throw new NotFoundError('Project');
  // return await response.json();
  
  // For MVP/development: Assume project exists if projectId is valid format
  // In production, this MUST be implemented to call the actual Project Management API
  if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId)) {
    throw new NotFoundError('Project');
  }
  
  // Return a mock project object for now
  // Replace this with actual API call or database query
  return {
    _id: projectId,
    exists: true,
  };
};

/**
 * Check if a user is a member of a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user is a project member
 */
export const isProjectMember = async (projectId, userId) => {
  // TODO: Integrate with Project Management API
  // This should check if userId is in the project's members array
  
  // Option 1: If projects are in the same database:
  // const Project = mongoose.model('Project');
  // const project = await Project.findById(projectId);
  // if (!project) return false;
  // return project.members.some(member => member.toString() === userId);
  
  // Option 2: If Project Management API is a separate service:
  // const response = await fetch(`${PROJECT_API_URL}/projects/${projectId}/members/${userId}`);
  // return response.ok;
  
  // For MVP/development: Assume user is a member if both IDs are valid
  // In production, this MUST be implemented to call the actual Project Management API
  if (!projectId || !userId) return false;
  if (!/^[0-9a-fA-F]{24}$/.test(projectId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
    return false;
  }
  
  // Return true for MVP (replace with actual validation)
  return true;
};

/**
 * Validate that a user can be assigned to a task in a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID to assign
 * @returns {Promise<void>}
 * @throws {ValidationError} If user is not a project member
 */
export const validateUserCanBeAssigned = async (projectId, userId) => {
  // Allow null/undefined to unassign a task
  if (!userId) {
    return;
  }

  const isMember = await isProjectMember(projectId, userId);
  
  if (!isMember) {
    throw new ValidationError('User is not a member of this project', {
      assignedTo: 'User must be a member of the project',
    });
  }
};

export default {
  validateProjectExists,
  isProjectMember,
  validateUserCanBeAssigned,
};

