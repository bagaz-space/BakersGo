import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LocaleProvider extends ChangeNotifier {
  static const _key = 'app_locale';
  final _storage = const FlutterSecureStorage();

  Locale _locale = const Locale('en');

  Locale get locale => _locale;

  Future<void> load() async {
    final saved = await _storage.read(key: _key);
    if (saved != null) {
      _locale = Locale(saved);
      notifyListeners();
    }
  }

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    await _storage.write(key: _key, value: locale.languageCode);
    notifyListeners();
  }
}
