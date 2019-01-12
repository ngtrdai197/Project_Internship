import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import{ Income }from'src/@core/interfaces/income.interface';
import { API } from 'src/@core/config/api';

@Injectable({
    providedIn: 'root'
})
export class IncomeService{
    constructor (private http: HttpClient)
    {}

    getIncomeByMonth(m: Number, y: Number): Observable<Income[]> {
        return this.http.get<Income[]>(`${API.HOST}/${API.MANAGER.GET_INCOME_BY_MONTH}?m=${m}&&y=${y}`);
    }
}