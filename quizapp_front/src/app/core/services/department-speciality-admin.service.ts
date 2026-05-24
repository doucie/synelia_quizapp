import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Department, DepartmentService } from './department.service';
import { Speciality, SpecialityService } from './speciality.service';

@Injectable({ providedIn: 'root' })
export class DepartmentSpecialityAdminService {
  constructor(
    private departmentService: DepartmentService,
    private specialityService: SpecialityService
  ) {}

  getActiveDepartments(): Observable<Department[]> {
    return this.departmentService.getAllDepartmentsByCriteria({
      isDeleted: false,
      page: 0,
      size: 10000
    }).pipe(
      map(response => this.sortDepartments(response.items || []))
    );
  }

  getDepartmentSpecialities(departmentId: number): Observable<Speciality[]> {
    return this.specialityService.getAll({
      page: 0,
      size: 10000,
      departmentId
    }).pipe(
      map(response =>
        (response.items || []).filter(speciality => speciality.departmentId === departmentId)
      )
    );
  }

  getDepartmentLabel(department: Partial<Department> | null | undefined): string {
    return department?.nom || department?.name || '';
  }

  resolveDepartmentName(departments: Department[], departmentId: number | null | undefined): string {
    if (typeof departmentId !== 'number' || departmentId <= 0) {
      return '';
    }

    return this.getDepartmentLabel(
      departments.find(department => department.id === departmentId)
    );
  }

  private sortDepartments(departments: Department[]): Department[] {
    return [...departments].sort((left, right) =>
      this.getDepartmentLabel(left).localeCompare(this.getDepartmentLabel(right))
    );
  }
}