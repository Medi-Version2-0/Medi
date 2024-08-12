export const validateField = async (schema: any, field: string, value: any) => {
    try {
      await schema.validateAt(field, { [field]: value });
      return null;
    } catch (error: any) {
      return error.message;
    }
  };