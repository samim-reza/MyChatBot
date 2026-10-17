export interface Paper {
  name: string;
  title: string;
  status: 'Published' | 'Submitted';
  venue?: string;
  link?: string;
}

export const papers: Paper[] = [
  {
    name: 'KobitaLM',
    title:
      'Provenance-Aware Evaluation of Adaptation, Retrieval, and Creative Diversity in Bengali Poetry Generation',
    status: 'Published',
    venue: 'IEEE COMPAS 2026',
    link: 'https://huggingface.co/samim-reza/KobitaLM',
  },
  {
    name: 'BanglaVerb-R',
    title:
      'Explaining Bengali Verb Transitivity Classification through Leakage-Controlled Evaluation',
    status: 'Published',
    venue: 'IEEE COMPAS 2026',
  },
  {
    name: 'IRIS',
    title:
      'Reliability-Gated Label Acceptance and Introspective Instance Selection for Human-in-the-Loop Deep Active Learning under Imperfect Annotators',
    status: 'Submitted',
    link: 'https://github.com/samim-reza/IRIS',
  },
  {
    name: 'FracEdge-R',
    title:
      'In the Hazy Laparoscopic Images Fractional-Order Edge Detection Reference-Controlled Assessment',
    status: 'Submitted',
  },
];
