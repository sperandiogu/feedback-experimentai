export class Feedback {
  static async create(feedbackData: any) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('Feedback submitted:', feedbackData);
    return { success: true, id: Math.random().toString() };
  }
}