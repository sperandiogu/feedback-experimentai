export class Box {
  static async list(sortBy: string, limit: number) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: '1',
        theme: 'Sabores do Verão',
        created_date: new Date(),
        products: [
          {
            id: '1',
            name: 'Açaí Premium Bowl',
            brand: 'AçaíMax',
            category: 'Sobremesas'
          },
          {
            id: '2',
            name: 'Água de Coco Natural',
            brand: 'Coco Fresh',
            category: 'Bebidas'
          },
          {
            id: '3',
            name: 'Biscoito Integral',
            brand: 'VitaLife',
            category: 'Snacks'
          }
        ]
      }
    ];
  }
}