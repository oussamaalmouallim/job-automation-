// Préparation commune des tests : assertions DOM (toBeInTheDocument…) et nettoyage du rendu entre deux tests.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())
