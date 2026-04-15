export function cityFaq(cityName: string): Array<{ question: string; answer: string }> {
  return [
    {
      question: `How do I compare neighbourhoods in ${cityName}?`,
      answer: `Use mktIQ to compare schools, demographics, transit access, housing mix, and household signals across neighbourhoods in ${cityName}.`
    },
    {
      question: `Is this ${cityName} neighbourhood data updated regularly?`,
      answer: "mktIQ updates neighbourhood data as new census and survey results become available. Check each profile for the most current figures."
    },
    {
      question: `What is the best neighbourhood in ${cityName}?`,
      answer: `The best neighbourhood depends on your priorities such as schools, commute, affordability, and household profile. mktIQ helps you evaluate each one objectively.`
    }
  ];
}

export function neighbourhoodFaq(name: string, cityName: string): Array<{ question: string; answer: string }> {
  return [
    {
      question: `What is ${name} in ${cityName} known for?`,
      answer: `${name} is a ${cityName} neighbourhood with a distinct household composition, housing mix, and income profile. The full breakdown is available on the profile page.`
    },
    {
      question: `Is ${name} a good neighbourhood for families?`,
      answer: `Review family household share, school mix, and parks data for ${name} to evaluate fit for family living.`
    },
    {
      question: `Where can I compare ${name} with nearby areas?`,
      answer: `Use the city directory on mktIQ to compare ${name} with other neighbourhoods in ${cityName}.`
    }
  ];
}
