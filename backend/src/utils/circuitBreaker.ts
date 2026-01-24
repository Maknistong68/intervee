/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures when external services (like OpenAI) are unavailable
 */

import { config } from '../config/env.js';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject all requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenMaxAttempts?: number;
}

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private resetTimeout: number;
  private halfOpenMaxAttempts: number;
  private halfOpenAttempts: number = 0;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold || config.circuitBreakerThreshold || 5;
    this.resetTimeout = options.resetTimeout || config.circuitBreakerResetTimeout || 30000;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts || 3;
  }

  /**
   * Execute an operation with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    // Check if we should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        console.log(`[CircuitBreaker:${this.name}] Transitioning from OPEN to HALF_OPEN`);
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
      } else {
        // Circuit is open, reject immediately
        console.log(`[CircuitBreaker:${this.name}] Circuit OPEN, rejecting request`);
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    // In HALF_OPEN state, limit attempts
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts > this.halfOpenMaxAttempts) {
        console.log(`[CircuitBreaker:${this.name}] HALF_OPEN max attempts reached, rejecting`);
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is HALF_OPEN, max attempts reached`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      // If circuit is now open after failure, try fallback
      if (fallback && this.getState() === CircuitState.OPEN) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      // Successful call in HALF_OPEN state, close the circuit
      console.log(`[CircuitBreaker:${this.name}] Success in HALF_OPEN, closing circuit`);
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failure in HALF_OPEN state, reopen circuit
      console.log(`[CircuitBreaker:${this.name}] Failure in HALF_OPEN, reopening circuit`);
      this.state = CircuitState.OPEN;
    } else if (this.state === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      // Threshold reached, open circuit
      console.log(`[CircuitBreaker:${this.name}] Failure threshold reached (${this.failureCount}), opening circuit`);
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats(): {
    name: string;
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  } {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    console.log(`[CircuitBreaker:${this.name}] Manual reset`);
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenAttempts = 0;
  }
}

// Pre-configured circuit breakers for common services
export const whisperCircuitBreaker = new CircuitBreaker({ name: 'whisper' });
export const gptCircuitBreaker = new CircuitBreaker({ name: 'gpt' });
