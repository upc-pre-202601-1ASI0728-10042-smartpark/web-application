import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { Icon } from '../../../shared/ui/icon';

/** Pantalla de inicio de sesión del operador. */
@Component({
  selector: 'sp-login-page',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';

    this.auth.login({ email: email.trim().toLowerCase(), password }).subscribe({
      next: () => {
        this.router.navigateByUrl(returnUrl).then((ok) => {
          // Si la navegación es bloqueada (p. ej. por un guard), restaura el estado.
          if (!ok) {
            this.loading.set(false);
            this.error.set('No se pudo abrir el panel. Verifica tus permisos.');
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 401
            ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
            : 'No se pudo conectar con el servidor. Inténtalo más tarde.',
        );
      },
    });
  }
}
