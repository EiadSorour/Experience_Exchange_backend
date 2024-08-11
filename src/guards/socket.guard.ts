import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class SocketGuard implements CanActivate {

    constructor(private readonly jwtService:JwtService){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        
        try{
			const accessToken = request.cookies.access_token;
            const payload = this.jwtService.verify(accessToken);
            request.data.payload = payload;
        }catch(error){
            return false;
        }

        return true;
    }
}