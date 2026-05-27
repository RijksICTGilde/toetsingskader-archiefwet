import '../assets/css/nldd/settings.css';
import '../assets/css/nldd/palettes.generated.css';
import '../assets/css/nldd/reset.css';
import '../assets/css/nldd/rich-text.css';
import '../assets/css/fonts.css';
import '../assets/css/theme.css';

// Auto-import all component CSS files
const modules = import.meta.glob('../assets/css/components/*.css', { eager: true });

export default {
  parameters: {
    layout: 'padded',
  },
};
