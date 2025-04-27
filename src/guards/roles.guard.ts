import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = { roles: ['admin'] }; // Mock user object, replace with actual user retrieval logic
    return this.matchRoles<boolean>(roles, user?.roles);
  }

  /**
   * Check if the user has any of the required roles
   * @param roles
   * @param userRoles
   * @returns
   */
  matchRoles<T>(roles: string[], userRoles: string[]): boolean {
    if (!userRoles) {
      return false;
    }
    return roles.some((role) => userRoles.includes(role));
  }
}
