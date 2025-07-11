export const treeData = {
  name: "Pronóstico?",
  children: [
    {
      name: "Soleado",
      children: [
        {
          name: "Humedad?",
          children: [
            { name: "Alta", children: [{ name: "NO JUGAR" }] },
            { name: "Normal", children: [{ name: "SÍ JUGAR" }] }
          ]
        }
      ]
    },
    {
      name: "Nublado",
      children: [{ name: "SÍ JUGAR" }]
    },
    {
      name: "Lluvioso",
      children: [
        {
          name: "Viento?",
          children: [
            { name: "Fuerte", children: [{ name: "NO JUGAR" }] },
            { name: "Débil", children: [{ name: "SÍ JUGAR" }] }
          ]
        }
      ]
    }
  ]
};
