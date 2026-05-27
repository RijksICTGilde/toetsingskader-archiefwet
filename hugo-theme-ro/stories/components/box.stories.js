export default { title: 'Components/Box' };

const box = ({ variant, content }) => `
  <div class="box${variant ? ` box--${variant}` : ''}">
    ${content}
  </div>
`;

export const Default = () => box({ content: '<p>Standaard box.</p>' });
export const Subtle = () => box({ variant: 'subtle', content: '<p>Subtiele box.</p>' });
export const Accent = () => box({ variant: 'accent', content: '<p>Accent-bordered box.</p>' });
