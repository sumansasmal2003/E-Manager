import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * @param {string} to - The required permission (e.g., "canUseAI") or role (e.g., "role:owner")
 * @param {ReactNode} children - The UI to show if allowed
 * @param {ReactNode} fallback - Optional UI to show if not allowed (default is null/nothing)
 */
const Restricted = ({ to, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return fallback;

  let isAllowed = false;

  // 1. Check for specific Role (syntax: "role:owner")
  if (to.startsWith('role:')) {
    const requiredRole = to.split(':')[1];
    if (user.role === requiredRole) isAllowed = true;
  }
  // 2. Check for Permission (e.g. "canViewSystemLog")
  else if (user.permissions && user.permissions[to] === true) {
    isAllowed = true;
  }
  // 3. Special Logic (e.g. "not:employee")
  else if (to.startsWith('not:')) {
    const excludedRole = to.split(':')[1];
    if (user.role !== excludedRole) isAllowed = true;
  }

  // Owner override: You might want owners to see everything.
  // If so, uncomment the line below:
  // if (user.role === 'owner') isAllowed = true;

  return isAllowed ? children : fallback;
};

export default Restricted;
