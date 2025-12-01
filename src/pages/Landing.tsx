import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  LineChart,
  Medal,
  Play,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PublicHeader } from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Custom Hook für Scroll-basierte Animationen
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animated Counter Component
function AnimatedCounter({
  end,
  suffix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const { t } = useTranslation();
  const heroRef = useInView();
  const featuresRef = useInView();
  const statsRef = useInView();
  const showcaseRef = useInView();
  const ctaRef = useInView();

  const stats = [
    {
      value: 10000,
      suffix: "+",
      label: t("landing.stats.workouts"),
      icon: Dumbbell,
    },
    {
      value: 500,
      suffix: "+",
      label: t("landing.stats.athletes"),
      icon: Users,
    },
    {
      value: 99,
      suffix: "%",
      label: t("landing.stats.uptime"),
      icon: Wifi,
    },
    {
      value: 50,
      suffix: "+",
      label: t("landing.stats.exercises"),
      icon: Activity,
    },
  ];

  const features = [
    {
      icon: Trophy,
      title: t("landing.features.scoreboard.title"),
      description: t("landing.features.scoreboard.description"),
      gradient: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-500",
      size: "large",
    },
    {
      icon: BarChart3,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      size: "small",
    },
    {
      icon: Users,
      title: t("landing.features.friends.title"),
      description: t("landing.features.friends.description"),
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      size: "small",
    },
    {
      icon: Dumbbell,
      title: t("landing.features.training.title"),
      description: t("landing.features.training.description"),
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
      size: "medium",
    },
    {
      icon: Bell,
      title: t("landing.features.notifications.title"),
      description: t("landing.features.notifications.description"),
      gradient: "from-red-500/20 to-rose-500/20",
      iconColor: "text-red-500",
      size: "small",
    },
    {
      icon: Smartphone,
      title: t("landing.features.pwa.title"),
      description: t("landing.features.pwa.description"),
      gradient: "from-indigo-500/20 to-violet-500/20",
      iconColor: "text-indigo-500",
      size: "small",
    },
  ];

  const showcaseFeatures = [
    {
      icon: LineChart,
      title: t("landing.showcase.progress.title"),
      description: t("landing.showcase.progress.description"),
    },
    {
      icon: Target,
      title: t("landing.showcase.goals.title"),
      description: t("landing.showcase.goals.description"),
    },
    {
      icon: Calendar,
      title: t("landing.showcase.history.title"),
      description: t("landing.showcase.history.description"),
    },
    {
      icon: Award,
      title: t("landing.showcase.achievements.title"),
      description: t("landing.showcase.achievements.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicHeader sticky={true} showContactButton={true} />

      {/* Hero Section */}
      <section
        ref={heroRef.ref}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(rgba(var(--primary-rgb), 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Floating Elements */}
          <div className="absolute top-20 left-[10%] animate-bounce opacity-20">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div
            className="absolute top-40 right-[15%] animate-bounce opacity-20"
            style={{ animationDelay: "0.5s" }}
          >
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <div
            className="absolute bottom-32 left-[20%] animate-bounce opacity-20"
            style={{ animationDelay: "1s" }}
          >
            <Medal className="w-7 h-7 text-primary" />
          </div>
          <div
            className="absolute bottom-40 right-[10%] animate-bounce opacity-20"
            style={{ animationDelay: "1.5s" }}
          >
            <Flame className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div
            className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${
              heroRef.isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-2 text-sm font-medium backdrop-blur-sm border-primary/20 animate-fade-in"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
              {t("landing.hero.badge")}
            </Badge>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
              <span className="block text-foreground">
                {t("landing.hero.title1")}
              </span>
              <span className="block bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {t("landing.hero.title2")}
              </span>
              <span className="block text-foreground">
                {t("landing.hero.title3")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              {t("landing.hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                asChild
                className="group text-lg px-8 py-7 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-105"
              >
                <Link to="/auth/register">
                  {t("landing.hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="group text-lg px-8 py-7 border-2 hover:bg-accent/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Link to="/contact">
                  <Play className="mr-2 h-5 w-5" />
                  {t("landing.hero.demo")}
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>{t("landing.hero.trust1")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{t("landing.hero.trust2")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>{t("landing.hero.trust3")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef.ref}
        className="py-20 border-y border-border/40 bg-muted/30 dark:bg-muted/10"
      >
        <div className="container mx-auto px-4">
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${
              statsRef.isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section ref={featuresRef.ref} className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              featuresRef.isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {t("landing.features.badge")}
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("landing.features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </div>

          {/* Bento Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-all duration-1000 delay-200 ${
              featuresRef.isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm ${
                  feature.size === "large"
                    ? "md:col-span-2 lg:col-span-1 lg:row-span-2"
                    : feature.size === "medium"
                      ? "md:col-span-2 lg:col-span-2"
                      : ""
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <CardContent
                  className={`relative p-6 md:p-8 ${feature.size === "large" ? "h-full flex flex-col justify-between" : ""}`}
                >
                  <div>
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon
                        className={`w-7 h-7 ${feature.iconColor}`}
                      />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {feature.size === "large" && (
                    <div className="mt-6 flex items-center text-primary font-medium">
                      <span>{t("landing.features.learnMore")}</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section
        ref={showcaseRef.ref}
        className="py-24 md:py-32 bg-muted/30 dark:bg-muted/10 border-y border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div
              className={`transition-all duration-1000 ${
                showcaseRef.isInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {t("landing.showcase.badge")}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t("landing.showcase.title")}
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                {t("landing.showcase.subtitle")}
              </p>

              <div className="space-y-6">
                {showcaseFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 group"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - App Preview */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${
                showcaseRef.isInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/20 to-primary/20 rounded-3xl blur-3xl" />

              {/* Mock App Preview */}
              <div className="relative bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-2xl">
                {/* App Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Sportify
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dashboard
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Live
                  </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">
                        {t("landing.showcase.preview.streak")}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      12 {t("landing.showcase.preview.days")}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">
                        {t("landing.showcase.preview.thisWeek")}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      8.5h
                    </div>
                  </div>
                </div>

                {/* Progress Chart Mock */}
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-foreground">
                      {t("landing.showcase.preview.progress")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      +23%
                    </Badge>
                  </div>
                  <div className="flex items-end gap-1 h-20">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {t("landing.showcase.preview.workout")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("landing.showcase.preview.today")}
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-0">
                      +150 XP
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef.ref}
        className="py-24 md:py-32 relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4">
          <div
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              ctaRef.isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {t("landing.cta.badge")}
            </Badge>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("landing.cta.title")}
            </h2>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("landing.cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                asChild
                className="group text-lg px-10 py-7 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-105"
              >
                <Link to="/auth/register">
                  {t("landing.cta.button")}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                {
                  icon: Check,
                  text: t("landing.cta.trust1"),
                  color: "text-green-500",
                },
                {
                  icon: Shield,
                  text: t("landing.cta.trust2"),
                  color: "text-blue-500",
                },
                {
                  icon: Zap,
                  text: t("landing.cta.trust3"),
                  color: "text-primary",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50"
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-foreground font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 dark:bg-muted/10 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-2xl text-foreground">
                  Sportify
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t("landing.footer.description")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("landing.footer.madeWith")}{" "}
                <Heart className="w-4 h-4 inline text-red-500 mx-1" />{" "}
                {t("landing.footer.by")}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("landing.footer.features")}
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    to: "/dashboard",
                    label: t("landing.footer.featuresList.dashboard"),
                  },
                  {
                    to: "/training",
                    label: t("landing.footer.featuresList.training"),
                  },
                  {
                    to: "/stats",
                    label: t("landing.footer.featuresList.stats"),
                  },
                  {
                    to: "/friends",
                    label: t("landing.footer.featuresList.friends"),
                  },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developer */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("landing.footer.developer")}
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>Leon Stadler</li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  React & TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t("landing.footer.tech.modern")}
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("landing.footer.legal")}
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    to: "/privacy",
                    label: t("landing.footer.legalLinks.privacy"),
                  },
                  { to: "/terms", label: t("landing.footer.legalLinks.terms") },
                  {
                    to: "/imprint",
                    label: t("landing.footer.legalLinks.imprint"),
                  },
                  {
                    to: "/contact",
                    label: t("landing.footer.legalLinks.contact"),
                  },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("landing.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(4px); opacity: 0.5; }
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
