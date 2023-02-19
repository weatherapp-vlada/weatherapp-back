class InvalidInputError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export default InvalidInputError;
