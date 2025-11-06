import {
  ArrowRight,
  BarChart3,
  Check,
  Flame,
  Heart,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PublicHeader } from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Trophy,
      title: t("landing.featuresList.liveScoreboard"),
      description: t("landing.featureDescriptions.liveScoreboard"),
    },
    {
      icon: BarChart3,
      title: t("landing.featureTitles.detailedStats"),
      description: t("landing.featureDescriptions.detailedStats"),
    },
    {
      icon: Users,
      title: t("landing.featuresList.community"),
      description: t("landing.featureDescriptions.community"),
    },
    {
      icon: Zap,
      title: t("landing.featureTitles.realtime"),
      description: t("landing.featureDescriptions.realtime"),
    },
    {
      icon: Shield,
      title: t("landing.featureTitles.secure"),
      description: t("landing.featureDescriptions.secure"),
    },
    {
      icon: Smartphone,
      title: t("landing.featureTitles.mobile"),
      description: t("landing.featureDescriptions.mobile"),
    },
  ];

  const testimonials = [
    {
      name: "Max Mustermann",
      role: "Personal Trainer",
      content:
        "Sportify hat meine Art zu trainieren revolutioniert. Die Statistiken helfen mir enorm.",
      rating: 5,
    },
    {
      name: "Anna Schmidt",
      role: "Hobby-Athletin",
      content:
        "Endlich eine App, die alle meine Fitnessdaten übersichtlich zusammenfasst.",
      rating: 5,
    },
    {
      name: "Tom Weber",
      role: "Crossfit Athlete",
      content:
        "Das Scoreboard motiviert mich täglich, meine Grenzen zu überwinden.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader sticky={true} showContactButton={true} />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-16 md:py-24 text-center overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <Badge
          variant="secondary"
          className="mb-6 px-4 py-1.5 text-sm font-medium"
        >
          <Flame className="w-3.5 h-3.5 mr-1.5 text-primary" />
          {t("landing.newFeature")}
        </Badge>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          {t("landing.heroTitle")}
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
            {t("landing.heroSubtitle")}
          </span>
          <br />
          {t("landing.heroSubtitle2")}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          {t("landing.heroDescription")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            size="lg"
            asChild
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
          >
            <Link to="/auth/register">
              {t("landing.startFree")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-lg px-8 py-6 border-2 hover:bg-accent"
          >
            <Link to="/contact">{t("landing.contactUs")}</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{t("landing.noCreditCard")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>{t("landing.secure")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>{t("landing.startNow")}</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-16 md:mb-20">
          <Badge variant="outline" className="mb-4">
            {t("landing.features")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("landing.featuresTitle")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landing.featuresDescription")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 bg-card"
            >
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors group-hover:scale-110 duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 dark:bg-muted/20 py-20 md:py-28 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="outline" className="mb-4">
              {t("landing.testimonials")}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t("landing.testimonialsTitle")}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              {t("landing.testimonialsDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card"
              >
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 dark:fill-yellow-500 text-yellow-400 dark:text-yellow-500"
                      />
                    ))}
                  </div>
                  <CardDescription className="text-base italic leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-28 text-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-3xl"></div>
        </div>

        <div className="relative">
          <Badge variant="secondary" className="mb-4">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            {t("landing.ctaBadge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t("landing.ctaDescription")}
          </p>

          <Button
            size="lg"
            asChild
            className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 mb-12"
          >
            <Link to="/auth/register">
              {t("landing.ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-foreground font-medium">
                    {t("landing.freeStart")}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-foreground font-medium">
                    {t("landing.noCommitment")}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 hover:bg-card transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-foreground font-medium">
                    {t("landing.startImmediately")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 dark:bg-muted/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  Sportify
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.footerDescription")}
                <br />
                {t("landing.footerDeveloped")}{" "}
                <Heart className="w-4 h-4 inline text-red-500" />{" "}
                {t("landing.footerBy")}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("landing.footerFeatures")}
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    {t("landing.featuresList.liveScoreboard")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training"
                    className="hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    {t("landing.featuresList.workoutTracking")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stats"
                    className="hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    {t("landing.featuresList.statistics")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/friends"
                    className="hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    {t("landing.featuresList.community")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("landing.footerDeveloper")}
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>Leon Stadler</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{t("landing.footerTech.react")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>{t("landing.footerTech.modern")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{t("landing.footerTech.opensource")}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("landing.footerLegal")}
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-primary transition-colors"
                  >
                    {t("landing.footerLinks.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-primary transition-colors"
                  >
                    {t("landing.footerLinks.terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/imprint"
                    className="hover:text-primary transition-colors"
                  >
                    {t("landing.footerLinks.imprint")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-primary transition-colors"
                  >
                    {t("landing.footerLinks.contact")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("landing.footerCopyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
