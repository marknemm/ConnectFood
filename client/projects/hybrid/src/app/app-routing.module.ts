import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bootstrap/login' },
  // Redirect web login/signup to app routes.
  { path: 'login', pathMatch: 'full', redirectTo: 'bootstrap/login' },
  { path: 'signup', pathMatch: 'full', redirectTo: 'bootstrap/signup' },
  { path: 'signup/:accountType', redirectTo: 'bootstrap/signup/:accountType' },
  { path: 'account', loadChildren: () => import('./account/account.module').then(mod => mod.AccountModule) },
  { path: 'bootstrap', loadChildren: () => import('./bootstrap/bootstrap.module').then(mod => mod.BootstrapModule) },
  { path: 'information', loadChildren: () => import('./information/information.module').then(mod => mod.InformationModule) },
  { path: 'password', loadChildren: () => import('./password/password.module').then(mod => mod.PasswordModule) },
  { path: '', loadChildren: () => import('./tabs/tabs.module').then(mod => mod.TabsModule) },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
