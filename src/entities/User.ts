export class User {
  static async me() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      boxes_received: 3
    };
  }

  static async updateMyUserData(data: any) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data };
  }
}