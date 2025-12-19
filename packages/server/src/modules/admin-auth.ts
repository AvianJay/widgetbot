import config from 'config'

/**
 * Checks if a user ID is an admin
 */
export function isAdmin(userId: string): boolean {
  if (!config.discord.admins || config.discord.admins.length === 0) {
    return false
  }
  return config.discord.admins.includes(userId)
}

/**
 * Express middleware to check if the request is from an admin
 */
export function requireAdmin(req: any, res: any, next: any) {
  // Extract user ID from authorization header or query parameter
  const userId = req.headers['x-user-id'] || req.query.userId
  
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin authentication required. Please provide a valid user ID.'
    })
  }
  
  if (!isAdmin(userId)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only administrators can access the message logger.'
    })
  }
  
  // User is admin, proceed
  next()
}
