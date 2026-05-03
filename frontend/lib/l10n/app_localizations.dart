import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_id.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('id')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'BakersGo'**
  String get appName;

  /// No description provided for @onboardingTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome to BakersGo!'**
  String get onboardingTitle;

  /// No description provided for @onboardingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Level up your bakery, starting now!'**
  String get onboardingSubtitle;

  /// No description provided for @onboardingCta.
  ///
  /// In en, this message translates to:
  /// **'Get Started!'**
  String get onboardingCta;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// No description provided for @signUp.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUp;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @userId.
  ///
  /// In en, this message translates to:
  /// **'User ID'**
  String get userId;

  /// No description provided for @brandName.
  ///
  /// In en, this message translates to:
  /// **'Brand Name'**
  String get brandName;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @resetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPassword;

  /// No description provided for @oldPassword.
  ///
  /// In en, this message translates to:
  /// **'Old Password'**
  String get oldPassword;

  /// No description provided for @newPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @masterIngredients.
  ///
  /// In en, this message translates to:
  /// **'Master Ingredients'**
  String get masterIngredients;

  /// No description provided for @masterRecipes.
  ///
  /// In en, this message translates to:
  /// **'Master Recipes'**
  String get masterRecipes;

  /// No description provided for @hpp.
  ///
  /// In en, this message translates to:
  /// **'HPP'**
  String get hpp;

  /// No description provided for @expenses.
  ///
  /// In en, this message translates to:
  /// **'Expenses'**
  String get expenses;

  /// No description provided for @sales.
  ///
  /// In en, this message translates to:
  /// **'Sales'**
  String get sales;

  /// No description provided for @reports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get reports;

  /// No description provided for @salesAmount.
  ///
  /// In en, this message translates to:
  /// **'Sales'**
  String get salesAmount;

  /// No description provided for @expensesAmount.
  ///
  /// In en, this message translates to:
  /// **'Expenses'**
  String get expensesAmount;

  /// No description provided for @safeBalance.
  ///
  /// In en, this message translates to:
  /// **'Safe Balance'**
  String get safeBalance;

  /// No description provided for @realBalance.
  ///
  /// In en, this message translates to:
  /// **'Real Balance'**
  String get realBalance;

  /// No description provided for @thisMonth.
  ///
  /// In en, this message translates to:
  /// **'This Month'**
  String get thisMonth;

  /// No description provided for @ingredientName.
  ///
  /// In en, this message translates to:
  /// **'Ingredient Name'**
  String get ingredientName;

  /// No description provided for @unit.
  ///
  /// In en, this message translates to:
  /// **'Unit'**
  String get unit;

  /// No description provided for @packagePrice.
  ///
  /// In en, this message translates to:
  /// **'Package Price (Rp)'**
  String get packagePrice;

  /// No description provided for @packageVolume.
  ///
  /// In en, this message translates to:
  /// **'Package Volume'**
  String get packageVolume;

  /// No description provided for @unitPrice.
  ///
  /// In en, this message translates to:
  /// **'Unit Price'**
  String get unitPrice;

  /// No description provided for @recipeName.
  ///
  /// In en, this message translates to:
  /// **'Recipe Name'**
  String get recipeName;

  /// No description provided for @servings.
  ///
  /// In en, this message translates to:
  /// **'Servings'**
  String get servings;

  /// No description provided for @baseRecipeCost.
  ///
  /// In en, this message translates to:
  /// **'Base Recipe Cost'**
  String get baseRecipeCost;

  /// No description provided for @addIngredient.
  ///
  /// In en, this message translates to:
  /// **'Add Ingredient'**
  String get addIngredient;

  /// No description provided for @amount.
  ///
  /// In en, this message translates to:
  /// **'Amount'**
  String get amount;

  /// No description provided for @productName.
  ///
  /// In en, this message translates to:
  /// **'Product Name'**
  String get productName;

  /// No description provided for @batchSize.
  ///
  /// In en, this message translates to:
  /// **'Batch Size (units)'**
  String get batchSize;

  /// No description provided for @kitchenZone.
  ///
  /// In en, this message translates to:
  /// **'Kitchen Zone'**
  String get kitchenZone;

  /// No description provided for @packagingZone.
  ///
  /// In en, this message translates to:
  /// **'Packaging Zone'**
  String get packagingZone;

  /// No description provided for @pricingZone.
  ///
  /// In en, this message translates to:
  /// **'Pricing Zone'**
  String get pricingZone;

  /// No description provided for @electricity.
  ///
  /// In en, this message translates to:
  /// **'Electricity (Rp)'**
  String get electricity;

  /// No description provided for @gas.
  ///
  /// In en, this message translates to:
  /// **'Gas (Rp)'**
  String get gas;

  /// No description provided for @labor.
  ///
  /// In en, this message translates to:
  /// **'Labor (Rp)'**
  String get labor;

  /// No description provided for @overhead.
  ///
  /// In en, this message translates to:
  /// **'Overhead (Rp)'**
  String get overhead;

  /// No description provided for @box.
  ///
  /// In en, this message translates to:
  /// **'Box / Packaging (Rp)'**
  String get box;

  /// No description provided for @sticker.
  ///
  /// In en, this message translates to:
  /// **'Sticker (Rp)'**
  String get sticker;

  /// No description provided for @disposable.
  ///
  /// In en, this message translates to:
  /// **'Disposable (Rp)'**
  String get disposable;

  /// No description provided for @resellerMargin.
  ///
  /// In en, this message translates to:
  /// **'Reseller Margin (%)'**
  String get resellerMargin;

  /// No description provided for @endUserMargin.
  ///
  /// In en, this message translates to:
  /// **'End User Margin (%)'**
  String get endUserMargin;

  /// No description provided for @resellerPrice.
  ///
  /// In en, this message translates to:
  /// **'Reseller Price'**
  String get resellerPrice;

  /// No description provided for @endUserPrice.
  ///
  /// In en, this message translates to:
  /// **'End User Price'**
  String get endUserPrice;

  /// No description provided for @resellerProfit.
  ///
  /// In en, this message translates to:
  /// **'Reseller Profit'**
  String get resellerProfit;

  /// No description provided for @endUserProfit.
  ///
  /// In en, this message translates to:
  /// **'End User Profit'**
  String get endUserProfit;

  /// No description provided for @totalCogs.
  ///
  /// In en, this message translates to:
  /// **'Total COGS (HPP)'**
  String get totalCogs;

  /// No description provided for @channel.
  ///
  /// In en, this message translates to:
  /// **'Channel'**
  String get channel;

  /// No description provided for @reseller.
  ///
  /// In en, this message translates to:
  /// **'Reseller'**
  String get reseller;

  /// No description provided for @endUser.
  ///
  /// In en, this message translates to:
  /// **'End User'**
  String get endUser;

  /// No description provided for @quantity.
  ///
  /// In en, this message translates to:
  /// **'Quantity'**
  String get quantity;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @date.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get date;

  /// No description provided for @description.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get description;

  /// No description provided for @category.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// No description provided for @filterByDay.
  ///
  /// In en, this message translates to:
  /// **'Day'**
  String get filterByDay;

  /// No description provided for @filterByMonth.
  ///
  /// In en, this message translates to:
  /// **'Month'**
  String get filterByMonth;

  /// No description provided for @filterByYear.
  ///
  /// In en, this message translates to:
  /// **'Year'**
  String get filterByYear;

  /// No description provided for @exportCsv.
  ///
  /// In en, this message translates to:
  /// **'Export CSV'**
  String get exportCsv;

  /// No description provided for @exportPdf.
  ///
  /// In en, this message translates to:
  /// **'Export PDF'**
  String get exportPdf;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageIndonesian.
  ///
  /// In en, this message translates to:
  /// **'Bahasa Indonesia'**
  String get languageIndonesian;

  /// No description provided for @errorGeneric.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get errorGeneric;

  /// No description provided for @errorInvalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Invalid email/ID or password.'**
  String get errorInvalidCredentials;

  /// No description provided for @successSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved successfully.'**
  String get successSaved;

  /// No description provided for @emptyState.
  ///
  /// In en, this message translates to:
  /// **'Nothing here yet. Tap + to add.'**
  String get emptyState;

  /// No description provided for @emptyIngredients.
  ///
  /// In en, this message translates to:
  /// **'No ingredients yet. Tap + to add.'**
  String get emptyIngredients;

  /// No description provided for @emptyRecipes.
  ///
  /// In en, this message translates to:
  /// **'No recipes yet. Tap + to add.'**
  String get emptyRecipes;

  /// No description provided for @emptyHpp.
  ///
  /// In en, this message translates to:
  /// **'No HPP entries yet. Tap + to add.'**
  String get emptyHpp;

  /// No description provided for @emptyExpenses.
  ///
  /// In en, this message translates to:
  /// **'No expenses yet. Tap + to add.'**
  String get emptyExpenses;

  /// No description provided for @emptySales.
  ///
  /// In en, this message translates to:
  /// **'No sales yet. Tap + to add.'**
  String get emptySales;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'id'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'id':
      return AppLocalizationsId();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
