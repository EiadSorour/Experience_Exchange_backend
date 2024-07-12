import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGurad implements CanActivate {

    constructor(private readonly jwtService:JwtService){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        
        try{
			const accessToken = request.cookies.access_token;
            const payload = this.jwtService.verify(accessToken);
            if(payload.role === "admin"){
                request.payload = payload;
            }else{
                return false;
            }
        }catch(error){
            return false;
        }

        return true;
    }
}