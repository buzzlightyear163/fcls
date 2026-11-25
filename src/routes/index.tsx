import { lazy } from 'react'

// Routes kartlagda från referensens _buildManifest
export const Board = lazy(() => import('../pages/Board'))
export const Launch = lazy(() => import('../pages/Launch'))
export const Otc = lazy(() => import('../pages/Otc'))
export const Burns = lazy(() => import('../pages/Burns'))
export const Rules = lazy(() => import('../pages/Rules'))
export const Roadmap = lazy(() => import('../pages/Roadmap'))
export const Token = lazy(() => import('../pages/Token'))
export const Privacy = lazy(() => import('../pages/Privacy'))
