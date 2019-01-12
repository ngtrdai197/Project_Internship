import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../config/api';
import { User } from 'src/@core/interfaces/user.interface';
import { Password } from 'src/@core/interfaces/password.interface';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // lấy thông tin user đăng nhập vào app -> query đến table AspNetUsers

  constructor(private http: HttpClient) { }

  _getUserByUserName(username: string): Observable<User> {
    return this.http.get<User>(`${API.HOST}/${API.USER.GET_USER_BY_USERNAME}?username=${username}`);
  }

  _updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${API.HOST}/${API.USER.UPDATE_USER}`, user);
  }

  _changePassword(pass: Password): Observable<any> {
    return this.http.post<any>(`${API.HOST}/${API.ACCOUNT.CHANGE_PASSWORD}`, pass);
  }

  uploadAvatar(formData: FormData):Observable<any> {
    return this.http.post<any>('http://localhost:8088/api/UploadFile/post', formData);
  }
}
