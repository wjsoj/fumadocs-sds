/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  SurveyForm,
  SurveySubmitButton,
  LoadSavedButton,
  SingleSelect,
  MultiSelect,
  TextInput
} from '@/components/quiz';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    SurveyForm,
    SurveySubmitButton,
    LoadSavedButton,
    SingleSelect,
    MultiSelect,
    TextInput,
    ...components,
  };
}
