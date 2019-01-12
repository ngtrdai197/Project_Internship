import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class DatepickerService1{
    private datePicker = new Subject<string>();
    constructor(){ };
    getdatePicker()
    {
        return this.datePicker.asObservable();
    }
    setdatePicker(datepicdir)
    {
        this.datePicker.next(datepicdir);
    }
}
