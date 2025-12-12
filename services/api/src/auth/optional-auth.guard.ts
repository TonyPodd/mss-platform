import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw an error if no token is provided
  handleRequest(err, user) {
    // If no user and no error, return null (guest user)
    if (!user && !err) {
      return null;
    }
    // If there's an error, throw it
    if (err) {
      throw err;
    }
    return user;
  }
}
