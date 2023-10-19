export class NotFoundContentError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = 'NotFoundContentError'; // (2)
    }
  }
  
  export class ForbiddenError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = 'ForbiddenError'; // (2)
    }
  }
  
  export class UnprocessableError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = 'UnprocessableError'; // (2)
    }
  }
  
  export class TooManyRequestsError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = 'TooManyRequestsError'; // (2)
    }
  }
  
  export class ExpiredSessionError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = 'ExpiredSessionError'; // (2)
    }
  }
  
  export class TooManySessionError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = 'TooManySessionError'; // (2)
    }
  }
  
  