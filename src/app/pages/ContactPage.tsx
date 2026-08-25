import { SEOMeta, breadcrumbSchema } from '../components/SEOMeta';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert('Formulaire envoyé ! (fonctionnalité à implémenter)');
  };

  return (
    <>
      <SEOMeta
        title="Contact"
        description="Contactez Urbyn by Atelier Urbanize pour vos projets de totems, palissades et massifs béton. Réponse sous 24h — info@urbanize.site"
        keywords="contact Urbyn, devis totem, devis palissade, Atelier Urbanize contact"
        url="/contact"
        jsonLd={breadcrumbSchema([{ name: "Accueil", url: "/" }, { name: "Contact", url: "/contact" }])}
      />
    <div className="max-w-6xl mx-auto pt-[var(--header-height)] px-4 pb-16">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="border-2 border-black"
        >
          ← Retour à l'accueil
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-black">Contactez-nous</h1>
      <p className="text-xl text-black mb-12">
        Notre équipe est à votre écoute pour répondre à toutes vos questions
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulaire */}
        <Card className="border-2 border-black">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-black">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-black font-bold">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-black font-bold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-black font-bold">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-black font-bold">Objet</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-black font-bold">Message</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full min-h-32 p-3 border-2 border-black rounded-md"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white">
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informations de contact */}
        <div className="space-y-6">
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-1">Email</h3>
                  <p className="text-black">info@urbanize.site</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-1">Téléphone</h3>
                  <p className="text-black">+33 6 24 20 22 43</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-1">Bureau Paris</h3>
                  <p className="text-black">
                    Urbanize<br />
                    39 rue Dupleix<br />
                    75015 Paris, France
                  </p>
                  <p className="text-sm text-black mt-1">TVA : FR73827458779</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="font-bold text-black mb-1">Bureau Dubaï</h3>
                  <p className="text-black">
                    Urbanize<br />
                    Splendour Villa 69, Al Safa 1<br />
                    Dubaï, UAE
                  </p>
                  <p className="text-sm text-black mt-1">Licence #1423255</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
