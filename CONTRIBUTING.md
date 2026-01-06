# Contributing to Synthetic Radio Host

Thank you for your interest in contributing to the Synthetic Radio Host project! 🎉

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- **Clear title** describing the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, Python version, Node version)
- **Screenshots** or **error logs** if applicable

### Suggesting Features

We welcome feature suggestions! Please create an issue with:
- **Feature description**: What should it do?
- **Use case**: Why is it needed?
- **Implementation ideas**: How might it work?

### Pull Requests

1. **Fork** the repository
2. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test thoroughly** - ensure nothing breaks
5. **Commit** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add support for multiple languages"
   ```
6. **Push** to your fork
7. **Create a pull request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots/examples if UI changes

## 📝 Coding Standards

### Python (Backend)

- **Style**: Follow [PEP 8](https://pep8.org/)
- **Formatting**: Use `black` for code formatting
- **Docstrings**: Use Google-style docstrings
- **Type hints**: Use type annotations where applicable

Example:
```python
def generate_script(topic: str, api_key: str) -> dict:
    """
    Generate a podcast script for the given topic.
    
    Args:
        topic: The Wikipedia topic to generate content about
        api_key: Groq API key for LLM access
        
    Returns:
        Dictionary containing the conversation script
        
    Raises:
        ValueError: If topic is empty or invalid
    """
    pass
```

### JavaScript/React (Frontend)

- **Style**: Use ESLint configuration provided
- **Formatting**: Use Prettier (2 spaces, single quotes)
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions

Example:
```javascript
const TopicInput = ({ onSubmit, disabled }) => {
  const [value, setValue] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Component JSX */}
    </form>
  );
};
```

### CSS

- Use **CSS Variables** for theming
- Follow **BEM naming** convention where applicable
- Keep styles **component-scoped**
- Maintain **glassmorphism** design aesthetic

## 🏗️ Project Structure

When adding new features, follow the existing structure:

```
synthetic_radio_host/
├── main.py              # Core business logic
├── server.py            # API endpoints
├── evaluator.py         # Quality evaluation
├── prompt_generator.py  # Improvement prompts
└── frontend/
    └── src/
        ├── components/  # React components
        ├── App.jsx      # Main app
        └── App.css      # Global styles
```

## 🧪 Testing

### Backend Testing
```bash
# Add unit tests in tests/ directory
pytest tests/

# Test individual components
python -m pytest tests/test_evaluator.py -v
```

### Frontend Testing
```bash
# Run in development mode
npm run dev

# Build for production to verify
npm run build
```

### Manual Testing Checklist
- [ ] Topic input and autocomplete work
- [ ] Progress tracking updates smoothly
- [ ] Audio plays correctly
- [ ] Evaluation results display properly
- [ ] Error handling works as expected
- [ ] Download functionality works

## 🎨 Feature Guidelines

### Adding New LLM Models
If you want to add support for new LLM providers:
1. Create a new module in `synthetic_radio_host/`
2. Implement the same interface as existing LLM calls
3. Add configuration in `.env.example`
4. Document in `ARCHITECTURE.md`

### Adding New TTS Voices
To add new text-to-speech voices:
1. Update `main.py` with new voice configurations
2. Test pronunciation quality
3. Update documentation with voice characteristics
4. Consider language support

### UI/UX Improvements
When improving the interface:
- Maintain the **glassmorphism** aesthetic
- Ensure **responsive design** (mobile-friendly)
- Add **smooth transitions** and animations
- Follow **accessibility guidelines** (WCAG 2.1)
- Test in multiple browsers

## 📚 Documentation

When adding features, update relevant documentation:
- [ ] `README.md` - If user-facing changes
- [ ] `ARCHITECTURE.md` - If system design changes
- [ ] `API_REFERENCE.md` - If API changes
- [ ] Code comments - For complex logic
- [ ] Docstrings - For all functions/classes

## 🐛 Debugging Tips

### Backend Issues
```bash
# Run server in debug mode
DEBUG=1 python server.py

# Check logs
tail -f logs/app.log

# Test API endpoints
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test Topic"}'
```

### Frontend Issues
```bash
# Check browser console for errors
# Use React Developer Tools
# Inspect network tab for API calls

# Clear cache if needed
rm -rf node_modules/.vite
npm run dev
```

## 🔍 Code Review Process

All pull requests will be reviewed for:
1. **Code quality** - Clean, readable, maintainable
2. **Functionality** - Does it work as intended?
3. **Testing** - Is it properly tested?
4. **Documentation** - Is it documented?
5. **Performance** - Does it impact performance?
6. **Security** - Are there any security concerns?

## 🎯 Good First Issues

Looking for where to start? Check issues labeled:
- `good first issue` - Easy to get started
- `help wanted` - We need your expertise!
- `documentation` - Improve docs
- `enhancement` - New features

## 💡 Ideas for Contributions

### Easy
- Add more Wikipedia language support
- Improve error messages
- Add loading animations
- Write unit tests

### Medium
- Add user preferences (voice, speed, language)
- Implement caching for Wikipedia content
- Add podcast history/favorites
- Improve mobile responsiveness

### Advanced
- Add support for custom TTS engines
- Implement real-time streaming
- Add multi-language podcast support
- Create admin dashboard
- Implement user authentication

## 📞 Getting Help

Need help contributing?
- Check existing [GitHub Issues](https://github.com/krishna-deora/Synthetic-Radio-Host/issues)
- Read the [Architecture Documentation](ARCHITECTURE.md)
- Contact the maintainer: [@krishna-deora](https://github.com/krishna-deora)

## 📜 Code of Conduct

### Our Standards

- Be **respectful** and **inclusive**
- Provide **constructive** feedback
- Focus on **what is best** for the community
- Show **empathy** towards other contributors

### Unacceptable Behavior

- Trolling, harassment, or discrimination
- Publishing others' private information
- Unprofessional conduct

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

**Thank you for contributing!** Every contribution, no matter how small, helps make this project better. 🙏
