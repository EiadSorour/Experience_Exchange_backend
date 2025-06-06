import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGurad implements CanActivate {

    constructor(private readonly jwtService:JwtService){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        
        try{
            console.log(`Entered AuthGuard`);
            console.log(`request cookies : ${request.cookies || "None"}`);
			const accessToken = request.cookies.access_token;
            console.log(`Access token inside AuthGuard : ${accessToken || "None"}`);
            const payload = this.jwtService.verify(accessToken);
            request.payload = payload;
        }catch(error){
            return false;
        }

        return true;
    }
}